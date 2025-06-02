<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, QueryProductsArgs } from '$lib/gql/graphql';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { omit } from 'es-toolkit';

	type Props = {
		/** if provided, meaning it is update page */
		collectionID?: string;
		onApply: (addProducts: Product[], removeProductIds: string[]) => Promise<void>;
		disabled?: boolean;
		selectedProductsMap?: Record<string, Product | undefined>;
	};

	let { collectionID, onApply, disabled, selectedProductsMap = $bindable({}) }: Props = $props();

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: '',
			child: checkbox,
		},
		{
			title: '',
			child: picture,
		},
		{
			title: '',
			child: title,
		},
	];

	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);

	let filterAllProductsVariables = $state<QueryProductsArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});

	let openAssignProductModal = $state(false);
	let forceReExecuteGraphqlQuery = $state(false);

	const handleClickOpenProductListModal = () => {
		openAssignProductModal = true;
		forceReExecuteGraphqlQuery = true;
	};

	const handleAssignproducts = async () => {
		const addProducts = [];
		const removeProductIds = [];

		for (const id of Object.keys(selectedProductsMap)) {
			if (selectedProductsMap[id]) {
				addProducts.push(selectedProductsMap[id]);
			} else {
				removeProductIds.push(id);
			}
		}

		loading = true;
		await onApply(addProducts, removeProductIds);
		loading = false;
	};
</script>

{#snippet checkbox({ item }: { item: Product })}
	{@const productAlreadyInCollection = item.collections?.some((col) => col.id === collectionID)}
	<Checkbox
		disabled={loading}
		checked={productAlreadyInCollection || !!selectedProductsMap[item.id]}
		size="sm"
		onchange={(evt) => {
			const { checked } = evt.target as HTMLInputElement;
			// prevent adding or removing already items
			if (checked && productAlreadyInCollection) return;
			else if (!checked && !productAlreadyInCollection && collectionID) return;

			if (checked) {
				selectedProductsMap = { ...selectedProductsMap, [item.id]: item };
			} else {
				selectedProductsMap = omit(selectedProductsMap, [item.id]);
			}
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

<SectionHeader class="mb-3">
	<div>Products in collection</div>
	<Button size="xs" onclick={handleClickOpenProductListModal} disabled={shouldDisable}>
		Assign Product
	</Button>
</SectionHeader>

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
				debounceTime: 800,
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
