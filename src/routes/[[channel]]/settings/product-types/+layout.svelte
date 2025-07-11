<script lang="ts">
	import { tranFunc } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_PRODUCT_TYPES()}
	listingPageLabel={$tranFunc('prdType.prdTypes')}
	newPageHref={AppRoute.SETTINGS_PRODUCT_TYPE_NEW()}
	newPageLabel={$tranFunc('prdType.addPrdType')}
	detailPageLabelGetter={(page) => page.params.id}
	detailRouteID="/[[channel]]/settings/product-types/[id]"
/>

<div>
	{@render children()}
</div>
