<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newChannelLink = AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
	listingPageLabel="Channels"
	newPageHref={newChannelLink}
	newPageLabel="New channel"
	detailPageLabelGetter={(page) => page.params.slug}
	detailRouteID="/[[channel]]/settings/configs/channels/[slug]"
/>

<div>
	{@render children()}
</div>
