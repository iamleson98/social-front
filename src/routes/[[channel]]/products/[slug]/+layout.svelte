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
	import type { Snippet } from 'svelte';

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

	// reactive: re-resolves when navigating between product routes
	const product = $derived(data.product);
	const productJsonLd = $derived(data.productJsonLd);

	const productVariants = $derived(product?.productVariants?.edges?.map((edge) => edge.node) ?? []);

	/** product media combined with every variant's media */
	const medias = $derived.by(() => {
		let allProductMedias: ProductMedia[] = [];

		if (product?.media) allProductMedias = allProductMedias.concat(product.media);
		for (const variant of productVariants) {
			const variantMedias = variant.media;
			if (variantMedias) allProductMedias = allProductMedias.concat(variantMedias);
		}

		return allProductMedias;
	});

	let categories = $derived.by(() => {
		if (!product?.category) return [];

		const { ancestors, ...rest } = product.category;
		if (!ancestors) return [rest];

		let accumulateCategories = [rest];
		return accumulateCategories
			.concat(ancestors.edges.map((edge) => edge.node))
			.sort((a, b) => a.level - b.level);
	});
</script>

{@html `<script type="application/ld+json">${JSON.stringify(productJsonLd)}</script>`}

<div class="space-y-4">
	<!-- breadcrumb -->
	<nav class="flex" aria-label="Breadcrumb">
		<ol class="inline-flex flex-wrap items-center gap-1.5 text-sm">
			<li>
				<a
					href={AppRoute.HOME()}
					class="flex items-center gap-1 text-gray-500 hover:text-brand-600 transition-colors"
				>
					<Icon icon={MingcuteHome} class="size-4" />
					{$T('common.home')}
				</a>
			</li>
			{#each categories as category, idx (idx)}
				<li class="flex items-center gap-1.5">
					<Icon icon={ChevronRight} class="size-3.5 text-gray-400" />
					<a
						href={`${AppRoute.CATEGORY_DETAILS(category.slug)}`}
						class="text-gray-500 hover:text-brand-600 transition-colors"
					>
						{category.name}
					</a>
				</li>
			{/each}
			<li class="flex items-center gap-1.5">
				<Icon icon={ChevronRight} class="size-3.5 text-gray-400" />
				<span class="font-medium text-gray-800 line-clamp-1">{product.name}</span>
			</li>
		</ol>
	</nav>

	<div class="flex flex-row max-tablet:flex-col gap-4 w-full">
		<div class="w-2/5 max-tablet:w-full">
			<div class="sticky top-[100px] max-tablet:static">
				<ProductMediaSlideShow {medias} />
			</div>
		</div>
		<div class="w-3/5 max-tablet:w-full">
			<ProductPricingPanel productInformation={product} />
		</div>
	</div>

	<!-- product more details -->
	<div class="card-surface p-4 max-tablet:p-3">
		<div role="tablist" class="tabs tabs-border tabs-md">
			{#each tabs as tab, idx (idx)}
				<a
					role="tab"
					class={['tab gap-1.5', page.url.pathname === tab.href && 'tab-active']}
					href={tab.href}
				>
					<Icon icon={tab.icon} class="size-4 opacity-70" />
					{tab.title}
				</a>
			{/each}
		</div>
		{@render children()}
	</div>
</div>
