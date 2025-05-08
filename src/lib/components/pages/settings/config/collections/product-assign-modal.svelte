<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, QueryProductsArgs } from '$lib/gql/graphql';

	type Props = {
		collectionID?: string;
    onApply: (addProductIds: string[], removeProductIds: string[]) => void;
	};

	let { collectionID }: Props = $props();

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

  const handleAssignproducts = () => {};
</script>

{#snippet checkbox({ item }: { item: Product })}
	<Checkbox
		checked={item.collections?.some((col) => col.id === collectionID) ||
			selectedProductIDs[item.id]}
		onchange={(evt) => {
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
	<div class="text-gray-700 font-semibold">Products in collection</div>
	<Button size="sm" onclick={handleClickOpenProductListModal}>Assign Product</Button>
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
>
	<div class="mb-4">
		<Input
			placeholder="Search product"
			class="w-full"
			bind:value={filterAllProductsVariables.filter!.search}
			inputDebounceOption={{
				onInput: () => (forceReExecuteGraphqlQuery = true), // force the result table to re-execute the query
				debounceTime: 800
			}}
		/>
	</div>

	{#if openAssignProductModal}
		<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_ADMIN}
			resultKey={'products'}
			bind:variables={filterAllProductsVariables}
			bind:forceReExecuteGraphqlQuery
			columns={PRODUCT_MODAL_COLUMNS}
		/>
	{/if}
</Modal>
