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
	listingPageHref={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
	listingPageLabel={$tranFunc('promotion.promotions')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_PROMOTION_NEW()}
	newPageLabel={$tranFunc('promotion.newPromo')}
	detailRouteID="/[[channel]]/settings/promotions/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
