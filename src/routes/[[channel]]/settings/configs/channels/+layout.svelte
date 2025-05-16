<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
	listingPageLabel="Channels"
	newPageHref={AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW()}
	newPageLabel="New channel"
	detailPageLabelGetter={(page) => page.params.slug}
	detailRouteID="/[[channel]]/settings/configs/channels/[slug]"
	backLinkUrl={AppRoute.SETTINGS_CONFIGS()}
/>

<div>
	{@render children()}
</div>
