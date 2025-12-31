<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_BULK_DELETE, PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Trash } from '$lib/components/icons';
	import { TablerExternalLink } from '$lib/components/icons/consts';
	import ProductFilterStateListener from '$lib/components/pages/home/product-filter-state-listener.svelte';
	import Filter from '$lib/components/pages/settings/products/filter.svelte';
	import Settings from '$lib/components/pages/settings/products/settings.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Checkbox } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		ProductOrderField,
		type Mutation,
		type MutationProductBulkDeleteArgs,
		type Product,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError, formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { SvelteSet } from 'svelte/reactivity';

	let productsFilterVariables = $state<QueryProductsArgs>({
		first: 10,
		search: '',
		filter: {
			search: '',
		},
	});
	let selectedProducts = $state(new SvelteSet<string>());
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const ProductBulkDeleteStore = operationStore<
		Pick<Mutation, 'productBulkDelete'>,
		MutationProductBulkDeleteArgs
	>({
		query: PRODUCT_BULK_DELETE,
		variables: { ids: [] },
		pause: true,
		onResult: (result) => {
			if (checkIfGraphqlResultHasError(result, 'productBulkDelete', $CommonState.DeleteSuccess)) {
				return;
			}
			selectedProducts.clear();
			tableRef?.triggerFetchData();
		},
	});

	const productColumns: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: selectAll,
			child: itemSelect,
		},
		{
			title: $T('common.pic'),
			child: pic,
		},
		{
			title: $T('settings.name'),
			child: name,
			key: ProductOrderField.Name,
			width: 300,
		},
		{
			title: $T('settings.availability'),
			child: availability,
		},
		{
			title: $T('settings.prices'),
			child: prices,
		},
		{
			title: $T('settings.createdAt'),
			child: createdAt,
			key: ProductOrderField.CreatedAt,
		},
		{
			title: $T('common.action'),
			child: actions,
		},
	]);

	const handleClickDeleteSelectedProducts = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				ProductBulkDeleteStore.reexecute({ variables: { ids: [...selectedProducts] } });
			},
		});
	};
</script>

<ProductFilterStateListener />

{#snippet selectAll({ items }: { items: Product[] })}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => {
			if (checked) items.forEach((item) => selectedProducts.add(item.id));
			else selectedProducts.clear();
		}}
		checked={items.length === selectedProducts.size && !!items.length}
		disabled={!items.length}
	/>
{/snippet}

{#snippet itemSelect({ item }: TableCellProps<Product>)}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => selectedProducts[checked ? 'add' : 'delete'](item.id)}
		checked={selectedProducts.has(item.id)}
	/>
{/snippet}

{#snippet pic({ item }: TableCellProps<Product>)}
	<div class="text-center">
		<Thumbnail size="sm" src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} />
	</div>
{/snippet}

{#snippet name({ item }: TableCellProps<Product>)}
	<a class="link" href={AppRoute.SETTINGS_PRODUCTS_EDIT(item.slug)}>{item.name}</a>
{/snippet}

{#snippet availability({ item }: TableCellProps<Product>)}
	{@const tooltip = item.channelListings?.length
		? item.channelListings.map((list) => list.channel.slug).join(', ')
		: ''}
	<Badge
		text={`${item.channelListings?.length || 0} channels`}
		class="tooltip tooltip-top"
		data-tip={tooltip}
		color="green"
	/>
{/snippet}

{#snippet prices({ item }: TableCellProps<Product>)}
	{#each item.channelListings || [] as channelListing}
		{@const startAmount = channelListing.pricing?.priceRange?.start?.gross?.amount || 0}
		{@const endAmount = channelListing.pricing?.priceRange?.stop?.gross?.amount || 0}
		<div class="flex items-center justify-between gap-1">
			<span class="text-gray-500 text-xs">{channelListing.channel.currencyCode}</span>
			<span class="font-semibold text-blue-600 text-right">
				{formatCurrency(startAmount)}-{formatCurrency(endAmount)}
			</span>
		</div>
	{/each}
{/snippet}

{#snippet createdAt({ item }: TableCellProps<Product>)}
	<span class="whitespace-nowrap">{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

{#snippet actions({ item }: TableCellProps<Product>)}
	<div class="text-center">
		<IconButton
			icon={TablerExternalLink}
			size="xs"
			href={AppRoute.PRODUCT_DETAILS(item.slug)}
			variant="light"
			target="_blank"
		/>
	</div>
{/snippet}

<div class="flex items-center justify-between mb-2">
	<Filter bind:variables={productsFilterVariables} {tableRef} />

	<dir class="flex items-center gap-2">
		{#if selectedProducts.size}
			<IconButton
				class="tooltip tooltip-left"
				data-tip={$T('btn.delete')}
				disabled={$ProductBulkDeleteStore.fetching}
				size="sm"
				icon={Trash}
				color="red"
				onclick={handleClickDeleteSelectedProducts}
			/>
		{/if}
		<Settings bind:variables={productsFilterVariables} bind:selectedIds={selectedProducts} />
	</dir>
</div>

<GraphqlPaginableTable
	query={PRODUCT_LIST_QUERY_ADMIN}
	bind:variables={productsFilterVariables}
	resultKey="products"
	columns={productColumns}
	bind:this={tableRef}
/>
