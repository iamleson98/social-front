<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { CATEGORY_DETAIL_QUERY } from '$lib/api';
	import { operationStore } from '$lib/api/operation';
	import ProductCardSkeleton from '$lib/components/common/product/product-card-skeleton.svelte';
	import {
		ArrowDown,
		ArrowUp,
		Category,
		FilterCog,
		RosetteDiscountChecked,
		Search,
	} from '$lib/components/icons';
	import Icon from '$lib/components/icons/icon.svelte';
	import CategoryProductList from '$lib/components/pages/category/category-product-list.svelte';
	import { ProductSortFields } from '$lib/components/pages/home/common';
	import { Button } from '$lib/components/ui';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { Select } from '$lib/components/ui/select';
	import {
		OrderDirection,
		ProductOrderField,
		type CategoryCountableEdge,
		type Channel,
		type ProductFilterInput,
		type Query,
		type QueryCategoryArgs,
		type QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { flipDirection, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const CategoryQuery = operationStore<
		Pick<Query, 'category'>,
		QueryCategoryArgs & {
			backgroundSize: number;
			AUTHENTICATED_STAFF_USER?: boolean;
		}
	>({
		query: CATEGORY_DETAIL_QUERY,
		variables: {
			slug: page.params.slug,
			backgroundSize: 500,
			AUTHENTICATED_STAFF_USER: true,
		},
		pause: !page.params.slug,
		requestPolicy: 'cache-and-network',
	});

	const PAGE_SIZE = 12;

	let channels = $state<Channel[]>([]);
	let loading = $state(true);
	let showError = $state(false);

	onMount(async () => {
		const result = await fetch('/api/channels', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		loading = false;

		if (result.ok) {
			const data = await result.json();
			channels = data.channels;
		} else {
			showError = true;
		}
	});

	let sortField = $state<ProductOrderField>(ProductOrderField.Price);
	let orderDirection = $state<OrderDirection>(OrderDirection.Asc);
	let priceFrom = $state('');
	let priceTo = $state('');
	let appliedPriceRange = $state<{ gte?: number; lte?: number } | null>(null);

	const categoryId = $derived($CategoryQuery.data?.category?.id);

	/** build the product list variables (one entry per loaded page) */
	let productPagesVariables = $state.raw<QueryProductsArgs[]>([]);

	$effect(() => {
		const id = categoryId;
		if (!id) {
			productPagesVariables = [];
			return;
		}

		const filter: ProductFilterInput = {
			categories: [id],
			price: appliedPriceRange
				? { gte: appliedPriceRange.gte ?? null, lte: appliedPriceRange.lte ?? null }
				: {},
			giftCard: false,
		};

		productPagesVariables = [
			{
				channel: page.params.channel || getCookieByKey(CHANNEL_KEY),
				first: PAGE_SIZE,
				filter,
				sortBy: {
					field: sortField,
					direction: orderDirection,
				},
			},
		];
	});

	const applyPriceRange = (): void => {
		const from = priceFrom.trim();
		const to = priceTo.trim();

		if (!from && !to) {
			appliedPriceRange = null;
			return;
		}

		appliedPriceRange = {
			gte: from && !isNaN(Number(from)) ? Number(from) : undefined,
			lte: to && !isNaN(Number(to)) ? Number(to) : undefined,
		};
	};

	const handleLoadMore = (endCursor: string): void => {
		productPagesVariables = productPagesVariables.concat({
			...productPagesVariables[productPagesVariables.length - 1],
			first: PAGE_SIZE,
			after: endCursor,
		});
	};

	const isLastPage = (idx: number): boolean => idx === productPagesVariables.length - 1;
</script>

<svelte:head>
	<title>{$CategoryQuery.data?.category?.name || $T('category.title')} - Sitename</title>
	{#if $CategoryQuery.data?.category?.seoDescription}
		<meta name="description" content={$CategoryQuery.data.category.seoDescription} />
	{/if}
</svelte:head>

{#if $CategoryQuery.fetching}
	<div class="flex gap-2">
		<div class="w-1/4 max-tablet:w-full space-y-2 sticky h-fit top-16">
			<Skeleton class="w-full h-66" />
		</div>
		<div class="w-3/4 max-tablet:w-full space-y-2 sticky h-fit top-16">
			<SkeletonContainer class="flex items-center gap-4 p-3! rounded-lg!">
				<Skeleton class="w-1/3 h-5" />
				<Skeleton class="w-1/3 h-5" />
			</SkeletonContainer>
		</div>
	</div>
{:else if $CategoryQuery.error}
	<Alert size="xs" variant="error">{$CategoryQuery.error.message}</Alert>
{:else if $CategoryQuery.data?.category}
	{@const { category } = $CategoryQuery.data}
	<div class="flex gap-2">
		<!-- sidebar -->
		<div class="w-1/4 max-tablet:w-full space-y-2 sticky h-fit top-16">
			<div class={SitenameCommonClassName}>
				<div
					class="h-66 mb-4 w-66 mx-auto rounded-sm bg-cover bg-center bg-no-repeat"
					style={`background-image: url(${category?.backgroundImage?.url});`}
				></div>

				<div class="text-gray-700">
					<div class="font-semibold">
						{category?.name}
					</div>
					<div class="flex items-center gap-1">
						<Icon icon={RosetteDiscountChecked} class="text-green-600" size="md" />
						<div class="text-xs text-gray-600">{$T('category.official')}</div>
					</div>
				</div>
			</div>

			<AccordionList
				header={$T('category.subCategories')}
				headerIcon={Category}
				items={category?.children?.edges || []}
				partialDisplay={5}
			>
				{#snippet child({ node }: CategoryCountableEdge)}
					<a
						href={`${AppRoute.CATEGORY_DETAILS(node.slug)}`}
						class="block p-2 rounded-md bg-white border border-gray-200 break-all"
					>
						<div class="flex items-center gap-2">
							<img
								src={node.backgroundImage?.url}
								alt={node.backgroundImage?.alt || node.name}
								class="rounded-md h-6 w-6"
							/>
							<span>{node.name}</span>
						</div>
					</a>
				{/snippet}
			</AccordionList>
		</div>

		<div class="w-3/4 max-tablet:w-full space-y-2">
			<!-- Filter Bar -->
			{#if loading}
				<SkeletonContainer class="flex items-center gap-4 p-3! rounded-lg!">
					<Skeleton class="w-1/3 h-5" />
					<Skeleton class="w-1/3 h-5" />
				</SkeletonContainer>
			{:else if channels.length > 0}
				{#snippet action()}
					<span class="text-[10px] font-semibold text-gray-600">
						{channels.find(
							(chan) => chan.slug === (page.params.channel || getCookieByKey(CHANNEL_KEY)),
						)?.currencyCode || 'VND'}
					</span>
				{/snippet}
				<div
					class="flex items-center gap-2 sticky h-fit top-16 bg-white rounded-lg border border-gray-200 p-2 shadow-xs flex-wrap"
				>
					<Icon icon={FilterCog} size="md" class="text-gray-500" />
					<div class="h-6 w-[2px] rounded-full bg-gray-300"></div>

					{#if category?.children?.edges?.length}
						<DropDown>
							{#snippet trigger({ onclick })}
								<div>
									<Button size="xs" variant="outline" color="gray" {onclick}>
										{$T('category.selectSubCategory')}
									</Button>
								</div>
							{/snippet}
							<div class="rounded-lg py-0.5">
								{#each category?.children?.edges || [] as edge, idx (idx)}
									<a
										href={AppRoute.CATEGORY_DETAILS(edge.node.slug)}
										role="menuitem"
										class="flex items-center cursor-pointer gap-2 py-1 px-1.5 text-sm transition-colors hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-100 duration-150"
									>
										<img
											src={edge.node.backgroundImage?.url}
											alt={edge.node.backgroundImage?.alt || edge.node.name}
											class="rounded-md border border-gray-200 h-7 w-7"
										/>
										<span>{edge.node.name}</span>
									</a>
								{/each}
							</div>
						</DropDown>
					{/if}

					<div class="flex items-center gap-1">
						<div class="text-xs font-semibold text-gray-600">{$T('common.price')}</div>
						<Input
							size="xs"
							placeholder={$T('common.from')}
							type="number"
							class="max-w-30"
							min={0}
							bind:value={priceFrom}
							{action}
						/>
						<span>-</span>
						<Input
							size="xs"
							placeholder={$T('common.to')}
							type="number"
							class="max-w-30"
							min={0}
							bind:value={priceTo}
							{action}
						/>
					</div>

					<div class="flex items-center gap-1">
						<Select
							options={$ProductSortFields}
							placeholder={$T('common.ordering')}
							class="max-w-30"
							size="xs"
							bind:value={sortField}
						/>
						<IconButton
							icon={orderDirection === OrderDirection.Asc ? ArrowDown : ArrowUp}
							size="xs"
							color="gray"
							aria-label={$T('common.ordering')}
							onclick={() => (orderDirection = flipDirection(orderDirection))}
						/>
					</div>

					<Button startIcon={Search} size="xs" onclick={applyPriceRange}
						>{$T('common.search')}</Button
					>
				</div>
			{:else if showError}
				<Alert size="xs" variant="error">{$T('error.channelFetchFailed')}</Alert>
			{/if}

			<div class={SitenameCommonClassName}>
				{#if !productPagesVariables.length}
					<div class="flex flex-wrap flex-row justify-between">
						{#each Array(4) as _, idx (idx)}
							<div class="w-1/2 p-0.5">
								<ProductCardSkeleton />
							</div>
						{/each}
					</div>
				{:else}
					{#each productPagesVariables as variables, idx (idx)}
						<CategoryProductList
							{variables}
							isLastPage={isLastPage(idx)}
							onLoadMore={handleLoadMore}
						/>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
