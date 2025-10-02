<script lang="ts">
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
		type ProductAttributeAssignmentUpdateInput,
		type Query,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { canUseAttributeForVariantSelection } from './utils';
	import { SvelteSet } from 'svelte/reactivity';

	type Props = {
		productAttributes?: Attribute[];
		productTypeId: string;
		disabled?: boolean;
		hasVariants: boolean;
		assignedVariantAttributes?: AssignedVariantAttribute[];
		variantSelectionOperations: ProductAttributeAssignmentUpdateInput[];
	};

	let {
		productAttributes = [],
		assignedVariantAttributes = [],
		productTypeId,
		disabled,
		hasVariants = $bindable(),
		variantSelectionOperations = $bindable(),
	}: Props = $props();

	let forceFetchAvailableAttributes = $state(false);
	let selectedProductAttributesToUnassign = $state<SvelteSet<string>>(new SvelteSet());
	let selectedProductVariantAttributesToUnassign = $state<SvelteSet<string>>(new SvelteSet());
	let selectedAttributesToAssign = $state<SvelteSet<string>>(new SvelteSet());
	let loading = $state(false);
	let attributeAssignType = $state<ProductAttributeType>();
	const shouldDisable = $derived(disabled || loading);

	let availableAttributeVariables = $state({
		id: productTypeId,
		first: 20,
		filter: {
			search: '',
		},
	});

	const ProductAttributeTableColumns = [
		{
			title: productAttributeSelectAll,
			child: productAttributeUnassignSelect,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Slug',
			child: slug,
		},
	];

	const AssignTableColumns = [
		{
			title: '',
			child: assignSelect,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'Slug',
			child: slug,
		},
	];

	const VariantAttributeTableColumns: TableColumnProps<AssignedVariantAttribute>[] = [
		{
			title: productVariantAttributeSelectAll,
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
		{
			title: 'Variant selection',
			child: attributeIsVariantSelection,
		},
	];

	const handleUnassignProductVariantAttributes = async () => {
		if (!selectedProductVariantAttributesToUnassign.size) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeUnassign'>,
			MutationProductAttributeUnassignArgs
		>(PRODUCT_TYPE_UNASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			attributeIds: [...selectedProductVariantAttributesToUnassign],
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productAttributeUnassign', $CommonState.EditSuccess))
			return;

		selectedProductVariantAttributesToUnassign = new SvelteSet();
	};

	const handleUnassignProductAttributes = async () => {
		if (!selectedProductAttributesToUnassign.size) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeUnassign'>,
			MutationProductAttributeUnassignArgs
		>(PRODUCT_TYPE_UNASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			attributeIds: [...selectedProductAttributesToUnassign],
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productAttributeUnassign', $CommonState.EditSuccess))
			return;

		selectedProductAttributesToUnassign = new SvelteSet();
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
			checkIfGraphqlResultHasError(result, 'productTypeReorderAttributes', $CommonState.EditSuccess)
		)
			return;
	};

	const handleAssignAttributes = async () => {
		if (!selectedAttributesToAssign.size || !attributeAssignType) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeAssign'>,
			MutationProductAttributeAssignArgs
		>(PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			operations: [...selectedAttributesToAssign].map((id) => ({
				id,
				type: attributeAssignType!,
			})),
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productAttributeAssign', $CommonState.EditSuccess))
			return;

		attributeAssignType = undefined;
		selectedAttributesToAssign.clear();
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

{#snippet attributeIsVariantSelection({ item }: { item: AssignedVariantAttribute })}
	{@const isNotVariantSelectable = !canUseAttributeForVariantSelection(item.attribute)}
	<Checkbox
		size="sm"
		data-interactive
		checked={variantSelectionOperations.some(
			(selection) => selection.id === item.attribute.id && selection.variantSelection,
		)}
		onCheckChange={(checked) => {
			variantSelectionOperations = variantSelectionOperations.map((selection) =>
				selection.id === item.attribute.id
					? { ...selection, variantSelection: checked }
					: selection,
			);
		}}
		disabled={shouldDisable || isNotVariantSelectable}
		class={[isNotVariantSelectable && 'tooltip tooltip-top']}
		data-tip={isNotVariantSelectable
			? `Attribute "${item.attribute.inputType}" can not be used as variant selection`
			: undefined}
	/>
{/snippet}

{#snippet productAttributeSelectAll({ items }: { items: Attribute[] })}
	<Checkbox
		size="sm"
		disabled={shouldDisable}
		checked={selectedProductAttributesToUnassign.size === items.length}
		onCheckChange={(checked) => {
			if (checked)
				selectedProductAttributesToUnassign = new SvelteSet(items.map((item) => item.id));
			else selectedProductAttributesToUnassign.clear();
		}}
		data-interactive
	/>
{/snippet}

{#snippet productVariantAttributeSelectAll({ items }: { items: AssignedVariantAttribute[] })}
	<Checkbox
		size="sm"
		disabled={shouldDisable}
		data-interactive
		checked={selectedProductVariantAttributesToUnassign.size === items.length}
		onCheckChange={(checked) => {
			if (checked)
				selectedProductVariantAttributesToUnassign = new SvelteSet(
					items.map((item) => item.attribute.id),
				);
			else selectedProductVariantAttributesToUnassign.clear();
		}}
	/>
{/snippet}

{#snippet variantAttrUnassignSelect({ item }: { item: AssignedVariantAttribute })}
	<Checkbox
		size="sm"
		data-interactive
		checked={selectedProductVariantAttributesToUnassign.has(item.attribute.id)}
		onCheckChange={(checked) => {
			if (checked) selectedProductVariantAttributesToUnassign.add(item.attribute.id);
			else selectedProductVariantAttributesToUnassign.delete(item.attribute.id);
		}}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet productAttributeUnassignSelect({ item }: { item: Attribute })}
	<Checkbox
		size="sm"
		data-interactive
		checked={selectedProductAttributesToUnassign.has(item.id)}
		onCheckChange={(checked) => {
			if (checked) selectedProductAttributesToUnassign.add(item.id);
			else selectedProductAttributesToUnassign.delete(item.id);
		}}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet assignSelect({ item }: { item: Attribute })}
	<Checkbox
		size="sm"
		checked={selectedAttributesToAssign.has(item.id)}
		onCheckChange={(checked) => {
			if (checked) selectedAttributesToAssign.add(item.id);
			else selectedAttributesToAssign.delete(item.id);
		}}
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
				onclick={handleUnassignProductAttributes}
				disabled={shouldDisable || !selectedProductAttributesToUnassign.size}
			>
				Unassign attributes
			</Button>
			<Button
				size="xs"
				endIcon={Plus}
				variant="light"
				disabled={shouldDisable}
				onclick={() => {
					attributeAssignType = ProductAttributeType.Product;
					forceFetchAvailableAttributes = true;
				}}
			>
				Assign attributes
			</Button>
		</div>
	</SectionHeader>

	<Table
		columns={ProductAttributeTableColumns}
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
					onclick={handleUnassignProductVariantAttributes}
					disabled={shouldDisable || !selectedProductVariantAttributesToUnassign.size}
				>
					Unassign attributes
				</Button>
				<Button
					size="xs"
					endIcon={Plus}
					variant="light"
					disabled={shouldDisable}
					onclick={() => {
						attributeAssignType = ProductAttributeType.Variant;
						forceFetchAvailableAttributes = true;
					}}
				>
					Assign attributes
				</Button>
			</div>
		</SectionHeader>

		<Table
			columns={VariantAttributeTableColumns}
			items={assignedVariantAttributes}
			disabled={shouldDisable}
			onDragEnd={(dragIndex, dropIndex) =>
				handleReorderAttributes(ProductAttributeType.Variant, dragIndex, dropIndex)}
		/>
	{/if}
</div>

<Modal
	header="Assign attribute"
	open={!!attributeAssignType}
	closeOnEscape
	closeOnOutsideClick
	size="sm"
	onClose={() => (attributeAssignType = undefined)}
	onCancel={() => (attributeAssignType = undefined)}
	onOk={handleAssignAttributes}
	disableElements={shouldDisable}
	disableOkBtn={!selectedAttributesToAssign.size || shouldDisable}
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
		autoRefetchOnVariableChange
	/>
</Modal>
