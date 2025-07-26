<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY,
		PRODUCT_TYPE_REORDER_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_UNASSIGN_ATTRIBUTES_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Search, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		ProductAttributeType,
		type AssignedVariantAttribute,
		type Attribute,
		type Mutation,
		type MutationProductAttributeAssignArgs,
		type MutationProductAttributeUnassignArgs,
		type MutationProductTypeReorderAttributesArgs,
		type Query,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		productAttributes?: Attribute[];
		productTypeId?: string;
		disabled?: boolean;
		hasVariants: boolean;
		assignedVariantAttributes?: AssignedVariantAttribute[];
	};

	let {
		productAttributes = [],
		productTypeId,
		disabled,
		hasVariants = $bindable(),
		assignedVariantAttributes = [],
	}: Props = $props();

	let forceFetchAvailableAttributes = $state(false);
	let selectedAttributesToUnassign = $state<Record<string, boolean>>({});
	let selectedAttributesToAssign = $state<Record<string, boolean>>({});
	let loading = $state(false);
	let openAttributeModelType = $state<ProductAttributeType>();
	const shouldDisable = $derived(disabled || loading);

	let availableAttributeVariables = $state({
		id: productTypeId,
		first: 20,
		filter: {
			search: '',
		},
	});

	const AttributeColumns: TableColumnProps<Attribute>[] = [
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Slug',
			child: slug,
		},
	];
	const UnassignTableColumns = [
		{
			title: '',
			child: unassignSelect,
		},
		...AttributeColumns,
	];
	const AssignTableColumns = [
		{
			title: '',
			child: assignSelect,
		},
		...AttributeColumns,
	];

	const VariantAttributeColumns: TableColumnProps<AssignedVariantAttribute>[] = [
		{
			title: '',
			child: variantAttrUnassignSelect,
		},
		{
			title: 'Name',
			child: variantAttrName,
		},
		{
			title: 'Slug',
			child: variantAttrSlug,
		},
	];

	const handleUnassignAttributes = async () => {
		const ids = Object.keys(selectedAttributesToUnassign);
		if (!ids.length || !productTypeId) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeUnassign'>,
			MutationProductAttributeUnassignArgs
		>(PRODUCT_TYPE_UNASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			attributeIds: ids,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'productAttributeUnassign',
				$tranFunc('common.editSuccess'),
			)
		)
			return;

		selectedAttributesToUnassign = {};
	};

	const handleReorderAttributes = async (
		attrType: ProductAttributeType,
		dragIndex: number,
		dropIndex: number,
	) => {
		if (!productTypeId || dropIndex === dragIndex) return;

		const steps = dropIndex - dragIndex;

		loading = true;

		const moves =
			attrType === ProductAttributeType.Product
				? [{ id: productAttributes[dragIndex].id, sortOrder: steps }]
				: [{ id: assignedVariantAttributes[dragIndex].attribute.id, sortOrder: steps }];

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productTypeReorderAttributes'>,
			MutationProductTypeReorderAttributesArgs
		>(PRODUCT_TYPE_REORDER_ATTRIBUTES_MUTATION, {
			productTypeId,
			moves,
			type: attrType,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'productTypeReorderAttributes',
				$tranFunc('common.editSuccess'),
			)
		)
			return;
	};

	const handleAssignAttributes = async () => {
		const ids = Object.keys(selectedAttributesToAssign);
		if (!ids.length || !productTypeId) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeAssign'>,
			MutationProductAttributeAssignArgs
		>(PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			operations: ids.map((id) => ({
				id,
				type: openAttributeModelType!,
			})),
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'productAttributeAssign',
				$tranFunc('common.editSuccess'),
			)
		)
			return;

		openAttributeModelType = undefined;
		selectedAttributesToAssign = {};
	};
</script>

{#snippet variantAttrName({ item }: { item: AssignedVariantAttribute })}
	<span>{item.attribute.name}</span>
{/snippet}

{#snippet variantAttrSlug({ item }: { item: AssignedVariantAttribute })}
	<span>{item.attribute.slug}</span>
{/snippet}

{#snippet name({ item }: { item: Attribute })}
	<span>{item.name}</span>
{/snippet}

{#snippet slug({ item }: { item: Attribute })}
	<span>{item.slug}</span>
{/snippet}

{#snippet variantAttrUnassignSelect({ item }: { item: AssignedVariantAttribute })}
	<Checkbox
		data-interactive
		checked={selectedAttributesToUnassign[item.attribute.id]}
		onCheckChange={(checked) =>
			checked
				? (selectedAttributesToUnassign[item.attribute.id] = checked)
				: delete selectedAttributesToUnassign[item.attribute.id]}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet unassignSelect({ item }: { item: Attribute })}
	<Checkbox
		data-interactive
		checked={selectedAttributesToUnassign[item.id]}
		onCheckChange={(checked) =>
			checked
				? (selectedAttributesToUnassign[item.id] = checked)
				: delete selectedAttributesToUnassign[item.id]}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet assignSelect({ item }: { item: Attribute })}
	<Checkbox
		checked={selectedAttributesToAssign[item.id]}
		onCheckChange={(checked) =>
			checked
				? (selectedAttributesToAssign[item.id] = checked)
				: delete selectedAttributesToAssign[item.id]}
		disabled={shouldDisable}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Product Attributes</div>
		<div class="flex gap-1">
			<Button
				size="xs"
				endIcon={Trash}
				variant="light"
				color="red"
				onclick={handleUnassignAttributes}
				disabled={shouldDisable || !Object.keys(selectedAttributesToUnassign).length}
			>
				Unassign attributes
			</Button>
			<Button
				size="xs"
				endIcon={Plus}
				variant="light"
				disabled={shouldDisable}
				onclick={() => {
					openAttributeModelType = ProductAttributeType.Product;
					forceFetchAvailableAttributes = true;
				}}
			>
				Assign attributes
			</Button>
		</div>
	</SectionHeader>

	<Table
		columns={UnassignTableColumns}
		items={productAttributes || []}
		onDragEnd={(dragIndex, dropIndex) =>
			handleReorderAttributes(ProductAttributeType.Product, dragIndex, dropIndex)}
		disabled={shouldDisable}
	/>

	<!-- MARK: variant attributes -->

	<Checkbox label="Has Variant attributes" bind:checked={hasVariants} disabled={shouldDisable} />

	{#if hasVariants}
		<SectionHeader>
			<div>Variant Attributes</div>

			<div class="flex gap-1">
				<Button
					size="xs"
					endIcon={Trash}
					variant="light"
					color="red"
					onclick={handleUnassignAttributes}
					disabled={shouldDisable || !Object.keys(selectedAttributesToUnassign).length}
				>
					Unassign attributes
				</Button>
				<Button
					size="xs"
					endIcon={Plus}
					variant="light"
					disabled={shouldDisable}
					onclick={() => {
						openAttributeModelType = ProductAttributeType.Variant;
						forceFetchAvailableAttributes = true;
					}}
				>
					Assign attributes
				</Button>
			</div>
		</SectionHeader>

		<Table
			columns={VariantAttributeColumns}
			items={assignedVariantAttributes}
			disabled={shouldDisable}
			onDragEnd={(dragIndex, dropIndex) =>
				handleReorderAttributes(ProductAttributeType.Variant, dragIndex, dropIndex)}
		/>
	{/if}
</div>

<Modal
	header="Assign attribute"
	open={!!openAttributeModelType}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAttributeModelType = undefined)}
	onCancel={() => (openAttributeModelType = undefined)}
	onOk={handleAssignAttributes}
	disableElements={shouldDisable}
	disableOkBtn={!Object.keys(selectedAttributesToAssign).length || shouldDisable}
>
	<Input
		startIcon={Search}
		placeholder="Search attribute"
		class="mb-2"
		disabled={shouldDisable}
		bind:value={availableAttributeVariables.filter.search}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: () => {
				forceFetchAvailableAttributes = true;
			},
		}}
	/>
	<GraphqlPaginableTable
		query={PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY}
		resultKey={'productType.availableAttributes' as keyof Query}
		columns={AssignTableColumns}
		disabled={shouldDisable}
		bind:variables={availableAttributeVariables}
		bind:forceReExecuteGraphqlQuery={forceFetchAvailableAttributes}
	/>
</Modal>
