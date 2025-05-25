<script lang="ts">
	import { page } from '$app/state';
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
	listingPageLabel="Giftcards"
	newPageHref={`${page.url.pathname}/?action=create`}
	newPageLabel="Isue new giftcard"
	detailRouteID="/[[channel]]/settings/configs/giftcards/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	backLinkUrl={AppRoute.SETTINGS_CONFIGS()}
/>

<div>
	{@render children()}
</div>
