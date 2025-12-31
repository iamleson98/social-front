<script lang="ts">
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import { page } from '$app/state';
	import { T } from '$i18n';
	import {
		Icon,
		HeadSet,
		SettingCheck,
		FileText,
		PackageExport,
		MingcuteHome,
		ChevronRight,
	} from '$lib/components/icons';
	import ProductPricingPanel from '$lib/components/pages/products/detail/product-pricing-pannel.svelte';
	import ProductMediaSlideShow from '$lib/components/pages/products/detail/product-slide-show-pannel.svelte';
	import { type ProductMedia } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import type { LayoutServerData } from './$types';
	import { onMount, type Snippet } from 'svelte';

	type Props = {
		data: LayoutServerData;
		children: Snippet;
	};

	let { data, children }: Props = $props();

	// prevent the page from scrolling to the top when navigating between tabs
	afterNavigate(disableScrollHandling);

	let tabs = $derived([
		{
			title: $T('product.tabDescription'),
			href: AppRoute.PRODUCT_DETAILS(page.params.slug!),
			icon: FileText,
		},
		{
			title: $T('product.tabAttributes'),
			href: AppRoute.PRODUCT_ATTRIBUTES(page.params.slug!),
			icon: SettingCheck,
		},
		{
			title: $T('product.tabFeedBack'),
			href: AppRoute.PRODUCT_FEEDBACKS(page.params.slug!),
			icon: HeadSet,
		},
		{
			title: $T('product.tabPackaging'),
			href: AppRoute.PRODUCT_PACKAGING(page.params.slug!),
			icon: PackageExport,
		},
	]);

	const { product, productJsonLd } = data;

	let medias = $state<ProductMedia[]>([]);

	let categories = $derived.by(() => {
		if (!product?.category) return [];

		const { ancestors, ...rest } = product.category;
		if (!ancestors) return [rest];

		let accumulateCategories = [rest];
		return accumulateCategories
			.concat(ancestors.edges.map((edge) => edge.node))
			.sort((a, b) => a.level - b.level);
	});

	onMount(async () => {
		let allProductMedias: ProductMedia[] = [];

		if (product?.media) allProductMedias = allProductMedias.concat(product.media);
		if (product?.variants?.length) {
			for (const variant of product.variants) {
				const variantMedias = variant.media;
				if (variantMedias) allProductMedias = allProductMedias.concat(variantMedias);
			}
		}

		medias = allProductMedias;
	});
</script>

{@html `<script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>`}

<div>
	<!-- breadcrumb -->
	<nav class="flex mb-2" aria-label="Breadcrumb">
		<ol class="inline-flex items-center gap-1 breadcrumb text-sm">
			<li>
				<a href={AppRoute.HOME()} class="flex items-center">
					<Icon icon={MingcuteHome} class="mr-1" />
					{$T('common.home')}
				</a>
			</li>
			{#each categories as category, idx (idx)}
				<li>
					<Icon icon={ChevronRight} />
					<a href={`${AppRoute.CATEGORY_DETAILS(category.slug)}`}>
						{category.name}
					</a>
				</li>
			{/each}
			<li class="text-gray-700">
				<Icon icon={ChevronRight} />
				<span>{product.name}</span>
			</li>
		</ol>
	</nav>

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-2 w-full mb-2">
		<div class="w-2/5 tablet:w-full">
			<ProductMediaSlideShow {medias} />
		</div>
		<div class="w-3/5 tablet:w-full">
			<ProductPricingPanel productInformation={product} />
		</div>
	</div>

	<!-- product more details -->
	<div class="bg-white border border-gray-200 rounded-lg p-3">
		<div role="tablist" class="tabs tabs-border tabs-md">
			{#each tabs as tab, idx (idx)}
				<a
					role="tab"
					class={['tab', page.url.pathname === tab.href && 'tab-active']}
					href={tab.href}
				>
					{tab.title}
				</a>
			{/each}
		</div>
		{@render children()}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.breadcrumb > li {
		@apply flex items-center not-last:text-blue-600;
	}
</style>
