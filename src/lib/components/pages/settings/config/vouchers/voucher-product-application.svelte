<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		VOUCHER_CATEGORIES_QUERY,
		VOUCHER_COLLECTIONS_QUERY,
		VOUCHER_PRODUCTS_QUERY,
	} from '$lib/api/admin/discount';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Category, Collection, Product, Query } from '$lib/gql/graphql';

	const TAB_NAMES = ['categories', 'products', 'collections', 'variants'];

	let activeTab = $derived(page.url.searchParams.get('tab'));

	type VoucherRelationVars = {
		voucherId: string;
		first?: number;
		after?: string;
		last?: number;
		before?: string;
	};

	let voucherRelationVars = $state<VoucherRelationVars>({
		voucherId: page.params.id,
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const COLLECTION_COLUMNS: TableColumnProps<Collection>[] = [
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'No. of products',
			child: products,
		},
	];

	const PRODUCT_COLUMNS: TableColumnProps<Product>[] = [
		{
			title: 'Image',
			child: prdImage,
		},
		{
			title: 'Name',
			child: prdName,
		},
		{
			title: 'Product type',
			child: productType,
		},
		{
			title: 'Availability',
			child: availability,
		},
	];

	const CATEGORY_COLUMNS: TableColumnProps<Category>[] = [
		{
			title: 'Image',
			child: categoryImage,
		},
		{
			title: 'Name',
			child: categoryName,
		},
		{
			title: 'No. of products',
			child: categoryNoOfProducts,
		},
	];

	afterNavigate(() => {
		voucherRelationVars = {
			voucherId: page.params.id,
			first: 10,
		};
		forceReExecuteGraphqlQuery = true;
	});
</script>

<!-- Collection -->

{#snippet name({ item }: { item: Collection })}
	<span>{item.name}</span>
{/snippet}

{#snippet products({ item }: { item: Collection })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

<!-- Product -->

{#snippet prdName({ item }: { item: Product })}
	<span>{item.name}</span>
{/snippet}

{#snippet prdImage({ item }: { item: Product })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet productType({ item }: { item: Product })}
	<span>{item.productType?.name}</span>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	<Badge
		text={item.channelListings?.length || 0}
		color={item.channelListings?.length ? 'green' : 'red'}
		class="tooltip tooltip-top"
		data-tip={item.channelListings?.map((item) => item.channel.name).join(', ') || 'No channels'}
	/>
{/snippet}

<!-- Category -->

{#snippet categoryName({ item }: { item: Category })}
	<span>{item.name}</span>
{/snippet}

{#snippet categoryNoOfProducts({ item }: { item: Category })}
	<span>{item.products?.totalCount || '-'}</span>
{/snippet}

{#snippet categoryImage({ item }: { item: Category })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

<div role="tablist" class="tabs tabs-border">
	{#each TAB_NAMES as tab, idx (idx)}
		<a
			role="tab"
			class="tab"
			class:tab-active={activeTab === tab}
			href="?tab={tab}"
			data-sveltekit-noscroll>{tab}</a
		>
	{/each}
</div>

<div>
	{#if activeTab === 'collections'}
		<SectionHeader>
			<span>Eligible Collections</span>
			<Button size="xs" variant="light">Assign collections</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_COLLECTIONS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.collections' as keyof Query}
			columns={COLLECTION_COLUMNS}
		/>
	{:else if activeTab === 'products'}
		<SectionHeader>
			<span>Eligible Products</span>
			<Button size="xs" variant="light">Assign products</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_PRODUCTS_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.products' as keyof Query}
			columns={PRODUCT_COLUMNS}
		/>
	{:else if activeTab === 'categories'}
		<SectionHeader>
			<span>Eligible Categories</span>
			<Button size="xs" variant="light">Assign categories</Button>
		</SectionHeader>

		<GraphqlPaginableTable
			query={VOUCHER_CATEGORIES_QUERY}
			bind:variables={voucherRelationVars}
			bind:forceReExecuteGraphqlQuery
			resultKey={'voucher.categories' as keyof Query}
			columns={CATEGORY_COLUMNS}
		/>
	{/if}
</div>
