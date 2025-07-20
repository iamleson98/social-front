<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY,
		PRODUCT_TYPE_REORDER_ATTRIBUTES_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Search } from '$lib/components/icons';
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
		type MutationProductTypeReorderAttributesArgs,
		type Query,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, toggleItemNoDup } from '$lib/utils/utils';

	type Props = {
		hasVariants: boolean;
		productTypeId?: string;
		assignedVariantAttributes?: AssignedVariantAttribute[];
	};

	let {
		hasVariants = $bindable(),
		productTypeId,
		assignedVariantAttributes = [],
	}: Props = $props();

	let openAssignAttributeModal = $state(false);
	let forceFetchAvailableAttributes = $state(false);
	let selectedAttributesToUnassign = $state<string[]>([]);
	let selectedAttributesToAssign = $state<string[]>([]);
	let loading = $state(false);

	let availableAttributeVariables = $state({
		id: productTypeId,
		first: 20,
		filter: {
			search: '',
		},
	});

	const handleAssignProductAttributes = async () => {
		if (!selectedAttributesToAssign.length || !productTypeId) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeAssign'>,
			MutationProductAttributeAssignArgs
		>(PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION, {
			productTypeId,
			operations: selectedAttributesToAssign.map((id) => ({
				id,
				type: ProductAttributeType.Variant,
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
	};

	const VariantAttributeColumns: TableColumnProps<AssignedVariantAttribute>[] = [
		{
			title: 'Unassign',
			child: unassignSelect,
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

	const AssignSelectColumn: TableColumnProps<Attribute>[] = [
		{
			title: '',
			child: assignSelect,
		},
		{
			title: 'Name',
			child: attributeName,
		},
		{
			title: 'Slug',
			child: attributeSlug,
		},
	];

	const handleReorderAttributes = async (dragIndex: number, dropIndex: number) => {
		if (!productTypeId || dropIndex - dragIndex == 0) return;

		const steps = dropIndex - dragIndex;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productTypeReorderAttributes'>,
			MutationProductTypeReorderAttributesArgs
		>(PRODUCT_TYPE_REORDER_ATTRIBUTES_MUTATION, {
			productTypeId: productTypeId!,
			moves: [{ id: assignedVariantAttributes![dragIndex].attribute.id, sortOrder: steps }],
			type: ProductAttributeType.Variant,
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
</script>

{#snippet name({ item }: { item: AssignedVariantAttribute })}
	<span>{item.attribute.name}</span>
{/snippet}

{#snippet slug({ item }: { item: AssignedVariantAttribute })}
	<span>{item.attribute.slug}</span>
{/snippet}

{#snippet attributeName({ item }: { item: Attribute })}
	<span>{item.name}</span>
{/snippet}

{#snippet attributeSlug({ item }: { item: Attribute })}
	<span>{item.slug}</span>
{/snippet}

{#snippet unassignSelect({ item }: { item: AssignedVariantAttribute })}
	<Checkbox
		data-interactive
		checked={selectedAttributesToUnassign.includes(item.attribute.id)}
		onCheckChange={(checked) =>
			(selectedAttributesToUnassign = toggleItemNoDup(
				selectedAttributesToUnassign,
				item.attribute.id,
				checked,
			))}
	/>
{/snippet}

{#snippet assignSelect({ item }: { item: Attribute })}
	<Checkbox
		checked={selectedAttributesToAssign.includes(item.id)}
		onCheckChange={(checked) =>
			(selectedAttributesToAssign = toggleItemNoDup(selectedAttributesToAssign, item.id, checked))}
	/>
{/snippet}

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<Checkbox label="Has Variant attributes" bind:checked={hasVariants} />

	{#if hasVariants}
		<SectionHeader>
			<div>Variant attributes</div>

			<div>
				<Button
					size="xs"
					endIcon={Plus}
					variant="light"
					onclick={() => {
						openAssignAttributeModal = true;
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
			onDragEnd={handleReorderAttributes}
		/>
	{/if}
</div>

<Modal
	header="Assign attribute"
	open={openAssignAttributeModal}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignAttributeModal = false)}
	onCancel={() => (openAssignAttributeModal = false)}
	onOk={handleAssignProductAttributes}
	disableElements={loading}
	disableOkBtn={!selectedAttributesToAssign.length || loading}
>
	<Input
		startIcon={Search}
		placeholder="Search attribute"
		class="mb-2"
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
		columns={AssignSelectColumn}
		bind:variables={availableAttributeVariables}
		bind:forceReExecuteGraphqlQuery={forceFetchAvailableAttributes}
	/>
</Modal>
