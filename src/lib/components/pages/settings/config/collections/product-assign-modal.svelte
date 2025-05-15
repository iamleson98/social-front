<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, QueryProductsArgs } from '$lib/gql/graphql';
	import SectionHeader from '$lib/components/common/section-header.svelte';

	type Props = {
		collectionID?: string;
		onApply: (addProductIds: string[], removeProductIds: string[]) => Promise<void>;
		disabled?: boolean;
	};

	let { collectionID, onApply, disabled }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: '',
			child: checkbox
		},
		{
			title: '',
			child: picture
		},
		{
			title: '',
			child: title
		}
	];

	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);

	let filterAllProductsVariables = $state<QueryProductsArgs>({
		first: 10,
		filter: {
			search: ''
		}
	});

	let selectedProductIDs = $state.raw<Record<string, boolean>>({});
	let openAssignProductModal = $state(false);
	let forceReExecuteGraphqlQuery = $state(false);

	const handleClickOpenProductListModal = () => {
		openAssignProductModal = true;
		forceReExecuteGraphqlQuery = true;
		selectedProductIDs = {};
	};

	const handleAssignproducts = async () => {
		const addProductIds = [];
		const removeProductIds = [];

		for (const id of Object.keys(selectedProductIDs)) {
			if (selectedProductIDs[id]) {
				addProductIds.push(id);
			} else {
				removeProductIds.push(id);
			}
		}

		loading = true;
		await onApply(addProductIds, removeProductIds);
		loading = false;
		// openAssignProductModal = false;
	};
</script>

{#snippet checkbox({ item }: { item: Product })}
	{@const productAlreadyInCollection = item.collections?.some((col) => col.id === collectionID)}
	<Checkbox
		disabled={loading}
		checked={productAlreadyInCollection || selectedProductIDs[item.id]}
		size="sm"
		onchange={(evt) => {
			const { checked } = evt.target as HTMLInputElement;
			// prevent adding or removing already items
			if (checked && productAlreadyInCollection) return;
			else if (!checked && !productAlreadyInCollection) return;

			selectedProductIDs = {
				...selectedProductIDs,
				[item.id]: (evt.target as HTMLInputElement).checked
			};
		}}
	/>
{/snippet}

{#snippet picture({ item }: { item: Product })}
	<div class="rounded-full border border-gray-200 w-8 h-8 overflow-hidden">
		<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} class="w-full h-full" />
	</div>
{/snippet}

{#snippet title({ item }: { item: Product })}
	<div>{item.name}</div>
{/snippet}

<div class="mb-4 flex items-center justify-between">
	<SectionHeader title="Products in collection" />
	<Button size="xs" onclick={handleClickOpenProductListModal} disabled={shouldDisable}>
		Assign Product
	</Button>
</div>

<Modal
	header="Assign products to collection"
	open={openAssignProductModal}
	okText="Assign"
	cancelText="Cancel"
	onOk={handleAssignproducts}
	onCancel={() => (openAssignProductModal = false)}
	onClose={() => (openAssignProductModal = false)}
	closeOnOutsideClick
	size="sm"
	disableElements={shouldDisable}
>
	<div class="mb-4">
		<Input
			placeholder="Search product"
			class="w-full"
			startIcon={Search}
			bind:value={filterAllProductsVariables.filter!.search}
			inputDebounceOption={{
				onInput: () => (forceReExecuteGraphqlQuery = true), // force the result table to re-execute the query
				debounceTime: 800
			}}
			disabled={shouldDisable}
		/>
	</div>

	{#if openAssignProductModal}
		<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_ADMIN}
			resultKey={'products'}
			bind:variables={filterAllProductsVariables}
			bind:forceReExecuteGraphqlQuery
			columns={PRODUCT_MODAL_COLUMNS}
			disabled={shouldDisable}
		/>
	{/if}
</Modal>
