<script lang="ts">
	import { T } from '$i18n';
	import {
		PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY,
		PRODUCT_TYPE_REORDER_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_UNASSIGN_ATTRIBUTES_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		Table,
		type GraphqlPaginableTableInterface,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
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
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import {
		// canUseAttributeForVariantSelection,
		MaximumVariantSelectionAttributes,
	} from './utils';
	import { set } from 'es-toolkit/compat';
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

	let selectedProductAttributesToUnassign = $state<SvelteSet<string>>(new SvelteSet());
	let selectedProductVariantAttributesToUnassign = $state<SvelteSet<string>>(new SvelteSet());
	let selectedAttributesToAssign = $state<SvelteSet<string>>(new SvelteSet());
	let loading = $state(false);
	let attributeAssignType = $state<ProductAttributeType>();
	const shouldDisable = $derived(disabled || loading);
	let tableRef = $state<GraphqlPaginableTableInterface>();

	let availableAttributeVariables = $state({
		id: productTypeId,
		first: 20,
		where: {
			withChoices: undefined,
		},
	});

	const ProductAttributeTableColumns: TableColumnProps<Attribute>[] = $derived([
		{
			title: productAttributeSelectAll,
			child: productAttributeUnassignSelect,
		},
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('common.slug'),
			child: { render: ({ item }) => item.slug },
		},
		{
			title: $T('attributes.valRequired'),
			child: attrValueRequired,
		},
	]);

	const AssignTableColumns: TableColumnProps<Attribute>[] = $derived([
		{
			title: '',
			child: assignSelect,
		},
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('common.slug'),
			child: { render: ({ item }) => item.slug },
		},
		{
			title: $T('attributes.valRequired'),
			child: attrValueRequired,
		},
	]);

	const VariantAttributeTableColumns: TableColumnProps<AssignedVariantAttribute>[] = $derived([
		{
			title: productVariantAttributeSelectAll,
			child: variantAttrUnassignSelect,
		},
		{
			title: $T('common.name'),
			child: variantAttrName,
		},
		{
			title: $T('common.slug'),
			child: { render: ({ item }) => item.attribute.slug },
		},
		// {
		// 	title: $T('attribute.isVariantSelection'),
		// 	child: attributeIsVariantSelection,
		// },
		{
			title: $T('attributes.valRequired'),
			child: variantAttrValueRequired,
		},
	]);

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

	const handleCloseAssignModal = () => {
		// reset the withChoices filter so that when we open the assign product attributes modal, we can see all attributes
		if (attributeAssignType === ProductAttributeType.Variant)
			set(availableAttributeVariables, 'where.withChoices', undefined);

		selectedAttributesToAssign.clear();

		attributeAssignType = undefined;
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
				variantSelection: attributeAssignType === ProductAttributeType.Variant,
			})),
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productAttributeAssign', $CommonState.EditSuccess))
			return;

		handleCloseAssignModal();
	};
</script>

{#snippet variantAttrName({ item }: TableCellProps<AssignedVariantAttribute>)}
	<a
		class="link"
		target="_blank"
		data-interactive
		href={AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(item.attribute.id)}>{item.attribute.name}</a
	>
{/snippet}

{#snippet attrValueRequired({ item }: TableCellProps<Attribute>)}
	<Checkbox size="sm" checked={item.valueRequired} disabled />
{/snippet}

{#snippet variantAttrValueRequired({ item }: TableCellProps<AssignedVariantAttribute>)}
	<Checkbox size="sm" checked={item.attribute.valueRequired} disabled />
{/snippet}

{#snippet name({ item }: TableCellProps<Attribute>)}
	<a
		class="link"
		target="_blank"
		data-interactive
		href={AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(item.id)}>{item.name}</a
	>
{/snippet}

<!-- {#snippet attributeIsVariantSelection({ item, idx }: TableCellProps<AssignedVariantAttribute>)}
	{@const canUseAsVariantSelection = canUseAttributeForVariantSelection(item.attribute)}
	<Checkbox
		size="sm"
		data-interactive
		bind:checked={variantSelectionOperations[idx].variantSelection}
		disabled={shouldDisable || !canUseAsVariantSelection}
		class={[!canUseAsVariantSelection && 'tooltip tooltip-top']}
		data-tip={!canUseAsVariantSelection
			? $T('attribute.attrCanNotBeVariantSelection', { inputType: item.attribute.inputType })
			: undefined}
	/>
{/snippet} -->

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

{#snippet variantAttrUnassignSelect({ item }: TableCellProps<AssignedVariantAttribute>)}
	<Checkbox
		size="sm"
		data-interactive
		checked={selectedProductVariantAttributesToUnassign.has(item.attribute.id)}
		onCheckChange={(checked) => {
			selectedProductVariantAttributesToUnassign[checked ? 'add' : 'delete'](item.attribute.id);
		}}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet productAttributeUnassignSelect({ item }: TableCellProps<Attribute>)}
	<Checkbox
		size="sm"
		data-interactive
		checked={selectedProductAttributesToUnassign.has(item.id)}
		onCheckChange={(checked) => {
			selectedProductAttributesToUnassign[checked ? 'add' : 'delete'](item.id);
		}}
		disabled={shouldDisable}
	/>
{/snippet}

{#snippet assignSelect({ item }: TableCellProps<Attribute>)}
	<Checkbox
		size="sm"
		checked={selectedAttributesToAssign.has(item.id)}
		onCheckChange={(checked) => {
			selectedAttributesToAssign[checked ? 'add' : 'delete'](item.id);
		}}
		disabled={shouldDisable}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('attribute.prdAttributes')}</div>
		<div class="flex gap-1">
			<Button
				size="xs"
				endIcon={Trash}
				variant="light"
				color="red"
				onclick={handleUnassignProductAttributes}
				disabled={shouldDisable || !selectedProductAttributesToUnassign.size}
			>
				{$T('attribute.unassignAttrs')}
			</Button>
			<Button
				size="xs"
				endIcon={Plus}
				variant="light"
				disabled={shouldDisable}
				onclick={() => {
					attributeAssignType = ProductAttributeType.Product;
				}}
			>
				{$T('attribute.assignAttr')}
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
	<Checkbox
		label={$T('prdType.hasVariantAttrs')}
		bind:checked={hasVariants}
		disabled={shouldDisable}
	/>
	{#if hasVariants}
		<SectionHeader>
			<div>{$T('attribute.variantAttrs')}</div>

			<div class="flex gap-1">
				<Button
					size="xs"
					endIcon={Trash}
					variant="light"
					color="red"
					onclick={handleUnassignProductVariantAttributes}
					disabled={shouldDisable || !selectedProductVariantAttributesToUnassign.size}
				>
					{$T('attribute.unassignAttrs')}
				</Button>
				<Button
					size="xs"
					endIcon={Plus}
					variant="light"
					disabled={shouldDisable ||
						assignedVariantAttributes.length >= MaximumVariantSelectionAttributes}
					onclick={() => {
						/**
						 * For variant selection attributes, we only fetch attributes with choices, like dropdown, swatch, multiselect.
						 * the `AttributeWhereInput` type supports filtering by `withChoices` to achieve this.
						 *
						 * So:
						 * 1) When we fetch selection variant attributes to a product type, we must enable `withChoices` option.
						 * 2) When we fetch product attributes to product type, we must disable `withChoices` option.
						 * 3) When we are done with assigning variant selection attributes, we must reset `withChoices` option to undefined,
						 *    so that when we open the assign product attributes modal, we can see all attributes
						 */
						set(availableAttributeVariables, 'where.withChoices', true);
						attributeAssignType = ProductAttributeType.Variant;
					}}
				>
					{$T('attribute.assignAttr')}
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
		<Alert size="sm">
			{$T('prdType.canChooseAtMost2VariantAttrsAlert')}
		</Alert>
	{/if}
</div>

<Modal
	header={$T('attribute.assignAttr')}
	open={!!attributeAssignType}
	closeOnEscape
	closeOnOutsideClick
	size="sm"
	onClose={handleCloseAssignModal}
	onCancel={handleCloseAssignModal}
	onOk={handleAssignAttributes}
	disableElements={shouldDisable}
	disableOkBtn={!selectedAttributesToAssign.size || shouldDisable}
	cancelText={$T('common.cancel')}
>
	<!-- <Input
		startIcon={Search}
		placeholder={$T('common.search')}
		class="mb-2"
		disabled={shouldDisable}
		bind:value={availableAttributeVariables.filter.search}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: () => {
				tableRef?.triggerFetchData();
			},
		}}
	/> -->
	<GraphqlPaginableTable
		query={PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY}
		resultKey={'productType.availableAttributes' as keyof Query}
		columns={AssignTableColumns}
		disabled={shouldDisable}
		bind:variables={availableAttributeVariables}
		bind:this={tableRef}
		autoRefetchOnPaginationParamsChange
		autoFetchDataOnMount
	/>
</Modal>
