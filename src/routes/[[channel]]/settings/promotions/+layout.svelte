<script lang="ts">
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
	listingPageLabel="Promotions"
	newPageHref={AppRoute.SETTINGS_CONFIGS_PROMOTION_NEW()}
	newPageLabel="New promotion"
	detailRouteID="/[[channel]]/settings/promotions/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	backLinkUrl={AppRoute.SETTINGS_CONFIGS()}
/>

<div>
	{@render children()}
</div>
