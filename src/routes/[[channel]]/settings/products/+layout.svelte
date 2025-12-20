<script lang="ts">
	import { T } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newProductLink = AppRoute.SETTINGS_PRODUCTS_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_PRODUCTS()}
	listingPageLabel={$T('product.products')}
	newPageHref={newProductLink}
	newPageLabel={$T('settings.newPrd')}
	detailRouteID="/[[channel]]/settings/products/[slug]"
	detailPageLabelGetter={(page) => page.params.slug}
/>

<div>
	{@render children()}
</div>
