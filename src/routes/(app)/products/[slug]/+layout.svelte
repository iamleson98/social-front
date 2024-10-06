<script lang="ts">
	import type { LayoutServerData } from './$types';
	import ProductMediaSlideShow from '$lib/components/pages/products/product-slide-show-pannel.svelte';
	import ProductPricingPanel from '$lib/components/pages/products/product-pricing-pannel.svelte';
	import {
		type Category,
		type ProductMedia,
		type ProductVariant,
		type Query,
		type QueryProductVariantsArgs
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
	import { AppRoute, getCookieByKey } from '$lib/utils';
	import { graphqlClient } from '$lib/client';
	import { operationStore, PRODUCT_VARIANTS_QUERY_STORE } from '$lib/stores/api';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick, type Snippet } from 'svelte';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';

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
	let allProductMedias = $state.raw(medias || []);
	let productVariants = $state.raw<ProductVariant[]>([]);
	/** list of categories to display in breadcrum section */
	let categories = $derived.by(() => {
		if (!category) return [];

		const { ancestors, ...rest } = category;

		let accumulateCategories = [rest];
		if (ancestors && ancestors.edges.length) {
			accumulateCategories = accumulateCategories.concat(ancestors.edges.map((edge) => edge.node));

			accumulateCategories.sort((a, b) => a.level - b.level);
		}

		return accumulateCategories;
	});

	const variantsStore = operationStore<Pick<Query, 'productVariants'>, QueryProductVariantsArgs>({
		kind: 'query',
		query: PRODUCT_VARIANTS_QUERY_STORE,
		context: { requestPolicy: 'network-only' },
		variables: {
			first: 20,
			channel: clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug),
			ids: variants?.map((variant) => variant.id) || []
		},
		pause: !variants || !variants.length
	});

	onMount(() => {
		if (!variants?.length) return;

		variantsStore.resume();

		const unsub = variantsStore.subscribe((result) => {
			if (result.data) {
				if (preHandleGraphqlResult(result)) return;

				if (result.data.productVariants?.edges) {
					let variantMedias: ProductMedia[] = [];
					let fullVariants: ProductVariant[] = [];

					result.data.productVariants.edges.forEach(({ node }) => {
						fullVariants.push(node);
						if (node.media) variantMedias = variantMedias.concat(node.media);
					});
					allProductMedias = [...allProductMedias, ...variantMedias];
					productVariants = fullVariants;
				}
			}
		});

		return () => unsub?.();
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

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-2 w-full mb-2">
		<ProductMediaSlideShow {allProductMedias} loading={$variantsStore.fetching} />
		<ProductPricingPanel
			{productInformation}
			{productVariants}
			loading={$variantsStore.fetching}
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
