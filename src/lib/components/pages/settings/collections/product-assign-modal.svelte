<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Plus, Search } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, QueryProductsArgs } from '$lib/gql/graphql';
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
	let productTableRef = $state<GraphqlPaginableTableInterface>();

	const handleClickOpenProductListModal = () => {
		openAssignProductModal = true;
		productTableRef?.triggerFetchData();
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
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet title({ item }: { item: Product })}
	<div>{item.name}</div>
{/snippet}

<SectionHeader class="mb-3">
	<div>{$T('collection.prdsInCol')}</div>
	<Button
		size="xs"
		onclick={handleClickOpenProductListModal}
		disabled={shouldDisable}
		variant="light"
		endIcon={Plus}
	>
		{$T('collection.assignPrd')}
	</Button>
</SectionHeader>

<Modal
	header={$T('collection.assignPrd')}
	open={openAssignProductModal}
	okText={$T('common.assign')}
	onOk={handleAssignproducts}
	onCancel={() => (openAssignProductModal = false)}
	onClose={() => (openAssignProductModal = false)}
	closeOnOutsideClick
	size="sm"
	disableElements={shouldDisable}
>
	<Input
		placeholder={$T('collection.searchPrd')}
		class="w-full mb-2"
		startIcon={Search}
		bind:value={filterAllProductsVariables.filter!.search}
		inputDebounceOption={{
			onInput: () => productTableRef?.triggerFetchData(), // force the result table to re-execute the query
			debounceTime: 800,
		}}
		disabled={shouldDisable}
	/>

	{#if openAssignProductModal}
		<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_ADMIN}
			resultKey={'products'}
			bind:variables={filterAllProductsVariables}
			columns={PRODUCT_MODAL_COLUMNS}
			disabled={shouldDisable}
			autoRefetchOnPaginationParamsChange
			bind:this={productTableRef}
			autoFetchDataOnMount
		/>
	{/if}
</Modal>
