<script lang="ts">
	import type { LayoutServerData } from './$types';
	import ProductMediaSlideShow from '$lib/components/pages/products/product-slide-show-pannel.svelte';
	import ProductPricingPanel from '$lib/components/pages/products/product-pricing-pannel.svelte';
	import {
		type Category,
		type Product,
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
		type IconType
	} from '$lib/components/icons';
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import { tClient } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import { onMount } from 'svelte';
	import { graphqlClient } from '$lib/client';
	import { PRODUCT_VARIANTS_QUERY_STORE } from '$lib/stores/api';
	import { handleResult } from '$lib/utils/utils';

	export let data: LayoutServerData;

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
			path: `/products/${data.slug}`,
			icon: FileText
		},
		{
			name: tClient('product.tabAttributes'),
			path: `/products/${data.slug}/attributes`,
			icon: SettingCheck
		},
		{
			name: tClient('product.tabFeedBack'),
			path: `/products/${data.slug}/customer-feedbacks`,
			icon: HeadSet
		},
		{
			name: tClient('product.tabPackaging'),
			path: `/products/${data.slug}/packaging`,
			icon: PackageExport
		}
	];

	const {
		media: medias,
		category,
		variants,
		channel,
		...productInformation
	} = data.data as Product;

	/** wait for product variants fully fetched, then display image slideshow */
	let findingVariants = true;
	let allProductMedias: ProductMedia[] = medias || [];
	let productVariants: ProductVariant[] = variants || [];

	/** list of categories to display in breadcrum section */
	let categories: Category[] = [];

	if (category) {
		const { ancestors, ...rest } = category;

		categories = [rest];
		if (ancestors) {
			categories = [...categories, ...ancestors.edges.map((edge) => edge.node)];
			categories.sort((a, b) => a.level - b.level);
		}
	}

	// full fetching product variants
	onMount(async () => {
		if (variants?.length) {
			const variantsResult = await graphqlClient
				.query<Pick<Query, 'productVariants'>>(PRODUCT_VARIANTS_QUERY_STORE, {
					ids: variants.map((variant) => variant.id),
					channel,
					first: 20
				})
				.toPromise();

			if (handleResult(variantsResult)) return;

			let variantMedias: ProductMedia[] = [];
			let fullVariants: ProductVariant[] = [];

			variantsResult.data?.productVariants?.edges.forEach(({ node }) => {
				fullVariants.push(node);
				if (node.media) variantMedias = [...variantMedias, ...node.media];
			});
			allProductMedias = [...allProductMedias, ...variantMedias];
			productVariants = fullVariants;
		}

		findingVariants = false;
	});
</script>

<div class="m-auto max-w-6xl">
	<!-- breadcrumb -->
	<div class="breadcrumbs text-sm px-2">
		<ul>
			<li>
				<a href="/" class="text-blue-600">
					<Icon icon={MingcuteHome} class="mr-1" />
					{tClient('common.home')}
				</a>
			</li>
			{#each categories as category, idx (idx)}
				<li>
					<a href={`${AppRoute.CATEGORIES}/${category.slug}`} class="text-blue-600">
						{category.name}
					</a>
				</li>
			{/each}
			<li>
				<span>{productInformation.name}</span>
			</li>
		</ul>
	</div>

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-1 w-full mb-1">
		<!-- slide show section -->
		<div class="w-2/5 rounded tablet:w-full flex flex-col gap-1">
			<ProductMediaSlideShow {allProductMedias} loading={findingVariants} />
		</div>

		<!-- product basic prices -->
		<div class="bg-white w-3/5 rounded tablet:w-full p-4">
			<ProductPricingPanel {productInformation} {productVariants} {findingVariants} />
		</div>
	</div>

	<!-- product more details -->
	<div class="bg-white w-full rounded p-6">
		<div class="text-gray-700 text-lg font-semibold mb-4">{tClient('product.prdInformation')}</div>

		<div class="flex items-center gap-2 mb-4">
			{#each tabs as tab, idx (idx)}
				<a role="tab" class="inline" href={tab.path}>
					<button class="tab-btn btn btn-sm" class:tab-active={tab.path === $page.url.pathname}>
						<Icon icon={tab.icon} />
						{tab.name}
					</button>
				</a>
			{/each}
		</div>

		<slot />
	</div>
</div>

<style lang="postcss">
	.tab-active {
		@apply bg-blue-100 text-blue-600 hover:bg-blue-100;
		outline: none !important;
	}
	.tab-btn {
		@apply border-none tablet:btn-xs tablet:h-max tablet:py-1;
	}
</style>
