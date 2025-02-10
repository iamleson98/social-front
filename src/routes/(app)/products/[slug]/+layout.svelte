<script lang="ts">
	import type { LayoutServerData } from './$types';
	import ProductMediaSlideShow from '$lib/components/pages/products/detail/product-slide-show-pannel.svelte';
	import ProductPricingPanel from '$lib/components/pages/products/detail/product-pricing-pannel.svelte';
	import { type ProductMedia } from '$lib/gql/graphql';
	import { page } from '$app/state';
	import {
		Icon,
		HeadSet,
		SettingCheck,
		FileText,
		PackageExport,
		MingcuteHome,
		ChevronRight
	} from '$lib/components/icons';
	import { afterNavigate, disableScrollHandling } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import { onMount, type Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { slideShowManager } from '$lib/stores/ui/slideshow';

	type Props = {
		data: LayoutServerData;
		children: Snippet;
	};

	let { data, children }: Props = $props();

	// prevent the page from scrolling to the top when navigating between tabs
	afterNavigate(disableScrollHandling);

	let tabs = $derived([
		{
			title: $tranFunc('product.tabDescription'),
			href: `${AppRoute.PRODUCTS}/${page.params.slug}`,
			icon: FileText,
		},
		{
			title: $tranFunc('product.tabAttributes'),
			href: `${AppRoute.PRODUCTS}/${page.params.slug}/attributes`,
			icon: SettingCheck,
		},
		{
			title: $tranFunc('product.tabFeedBack'),
			href: `${AppRoute.PRODUCTS}/${page.params.slug}/customer-feedbacks`,
			icon: HeadSet,
		},
		{
			title: $tranFunc('product.tabPackaging'),
			href: `${AppRoute.PRODUCTS}/${page.params.slug}/packaging`,
			icon: PackageExport,
		}
	]);

	const {
		product: { media, category, channel, variants, ...productInformation },
		productJsonLd
	} = data;

	let categories = $derived.by(() => {
		if (!category) return [];

		const { ancestors, ...rest } = category;
		if (!ancestors) return [rest];

		let accumulateCategories = [rest];
		return accumulateCategories
			.concat(ancestors.edges.map((edge) => edge.node))
			.sort((a, b) => a.level - b.level);
	});

	onMount(() => {
		let allProductMedias: ProductMedia[] = [];

		if (media) allProductMedias = allProductMedias.concat(media);
		if (variants?.length) {
			for (const variant of variants) {
				const variantMedias = variant.media;
				if (variantMedias) allProductMedias = allProductMedias.concat(variantMedias);
			}
		}

		slideShowManager.setMedias(allProductMedias);

		return () => slideShowManager.reset();
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
					{$tranFunc('common.home')}
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

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-2 w-full mb-2">
		<div class="w-2/5 tablet:w-full">
			<ProductMediaSlideShow />
		</div>
		<div class="w-3/5 tablet:w-full">
			<ProductPricingPanel {productInformation} productVariants={variants || []} />
		</div>
	</div>

	<!-- product more details -->
	<div class="bg-white border border-gray-200 rounded-lg p-6">
		<!-- <div class="text-gray-700 text-lg font-semibold mb-4">{$tranFunc('product.prdInformation')}</div> -->

		<div class="flex items-center gap-2 mb-4">
			{#each tabs as tab, idx (idx)}
				<a role="tab" class="inline" href={tab.href}>
					<Button
						class={`${page.url.pathname === tab.href ? '!bg-blue-100 !text-blue-600 hover:bg-blue-100' : ''} tablet:h-full tablet:py-1`}
						startIcon={tab.icon}
						size="xs"
						variant="light"
						color="gray"
					>
						{tab.title}
					</Button>
				</a>
			{/each}
		</div>

		{@render children()}
	</div>
</div>

<style>
	@import 'tailwindcss/theme';

	.breadcrumb > li {
		@apply flex items-center not-last:text-blue-700;
	}
</style>
