<script lang="ts">
	import type { LayoutServerData } from './$types';
	import ProductMediaSlideShow from '$lib/components/pages/products/product-slide-show-pannel.svelte';
	import ProductPricingPanel from '$lib/components/pages/products/product-pricing-pannel.svelte';
	import {
		type Category,
		type ProductMedia,
		type ProductVariant,
		type Query
	} from '$lib/gql/graphql';
	import { page } from '$app/stores';
	import {
		Icon,
		HeadSet,
		SettingCheck,
		FileText,
		PackageExport,
		MingcuteHome,
		type IconType,
		ChevronRight
	} from '$lib/components/icons';
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import { tClient } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import { graphqlClient } from '$lib/client';
	import { PRODUCT_VARIANTS_QUERY_STORE } from '$lib/stores/api';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick, type Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button/Button.svelte';

	interface Props {
		data: LayoutServerData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	// prevent the page from scrolling to the top when navigating between tabs
	afterNavigate(() => {
		disableScrollHandling();
	});

	type TabType = {
		name: string;
		icon: IconType;
		path: string;
	};

	const tabs: TabType[] = [
		{
			name: tClient('product.tabDescription'),
			path: `${AppRoute.PRODUCTS}/${$page.params.slug}`,
			icon: FileText
		},
		{
			name: tClient('product.tabAttributes'),
			path: `${AppRoute.PRODUCTS}/${$page.params.slug}/attributes`,
			icon: SettingCheck
		},
		{
			name: tClient('product.tabFeedBack'),
			path: `${AppRoute.PRODUCTS}/${$page.params.slug}/customer-feedbacks`,
			icon: HeadSet
		},
		{
			name: tClient('product.tabPackaging'),
			path: `${AppRoute.PRODUCTS}/${$page.params.slug}/packaging`,
			icon: PackageExport
		}
	];

	const {
		product: { media: medias, category, channel, variants, ...productInformation },
		productJsonLd
	} = data;

	/** wait for product variants fully fetched, then display image slideshow */
	let findingVariants = $state(true);
	let allProductMedias = $state.frozen(medias || []);
	let productVariants = $state.frozen<ProductVariant[]>([]);

	/** list of categories to display in breadcrum section */
	let categories = $state.frozen<Category[]>([]);

	if (category) {
		const { ancestors, ...rest } = category;

		let accumulateCategories = [rest];
		if (ancestors && ancestors.edges.length) {
			accumulateCategories = [...accumulateCategories, ...ancestors.edges.map((edge) => edge.node)];
			accumulateCategories.sort((a, b) => a.level - b.level);
		}

		categories = accumulateCategories;
	}

	// full fetching product variants
	onMount(() => {
		if (variants && variants.length) {
			const { unsubscribe } = graphqlClient
				.query<Pick<Query, 'productVariants'>>(
					PRODUCT_VARIANTS_QUERY_STORE,
					{
						ids: variants.map((variant) => variant.id),
						channel,
						first: 20
					},
					{
						requestPolicy: 'cache-first'
					}
				)
				.subscribe((result) => {
					if (preHandleGraphqlResult(result)) return;

					let variantMedias: ProductMedia[] = [];
					let fullVariants: ProductVariant[] = [];

					result.data?.productVariants?.edges.forEach(({ node }) => {
						fullVariants.push(node);
						if (node.media) variantMedias = variantMedias.concat(node.media);
					});
					allProductMedias = [...allProductMedias, ...variantMedias];
					productVariants = fullVariants;
					findingVariants = false;
					tick();
				});

			return unsubscribe;
		}
	});
</script>

{@html `<script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>`}

<div>
	<!-- breadcrumb -->
	<nav class="flex mb-2" aria-label="Breadcrumb">
		<ol class="inline-flex items-center space-x-1 breadcrumb text-sm">
			<li>
				<a href="/" class="flex items-center">
					<Icon icon={MingcuteHome} class="mr-1" />
					{tClient('common.home')}
				</a>
			</li>
			{#each categories as category, idx (idx)}
				<li>
					<Icon icon={ChevronRight} />
					<a href={`${AppRoute.CATEGORIES}/${encodeURIComponent(category.slug)}`}>
						{category.name}
					</a>
				</li>
			{/each}
			<li class="text-gray-700">
				<Icon icon={ChevronRight} />
				<span>{productInformation.name}</span>
			</li>
		</ol>
	</nav>

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-1 w-full mb-1">
		<ProductMediaSlideShow {allProductMedias} loading={findingVariants} />
		<ProductPricingPanel
			{productInformation}
			{productVariants}
			loading={findingVariants}
			numOfVariants={variants?.length || 0}
		/>
	</div>

	<!-- product more details -->
	<div class="bg-white w-full rounded p-6">
		<div class="text-gray-700 text-lg font-semibold mb-4">{tClient('product.prdInformation')}</div>

		<div class="flex items-center gap-2 mb-4">
			{#each tabs as tab, idx (idx)}
				<a role="tab" class="inline" href={tab.path}>
					<Button
						class={`${$page.url.pathname === tab.path ? 'tab-active' : ''} tab-btn`}
						startIcon={tab.icon}
						size="xs"
						variant="light"
						color="gray"
					>
						{tab.name}
					</Button>
				</a>
			{/each}
		</div>

		{@render children()}
	</div>
</div>

<style lang="postcss">
	.tab-active {
		@apply !bg-blue-100 !text-blue-600 hover:bg-blue-100;
	}
	.tab-btn {
		@apply tablet:h-max tablet:py-1;
	}
	.breadcrumb > li:not(:last-child) {
		@apply text-blue-700;
	}
	.breadcrumb > li {
		@apply flex items-center;
	}
</style>
