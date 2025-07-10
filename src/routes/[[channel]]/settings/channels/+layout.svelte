<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { tranFunc } from '$i18n';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
	listingPageLabel={$tranFunc('channel.channels')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_CHANNEL_NEW()}
	newPageLabel={$tranFunc('channel.new')}
	detailPageLabelGetter={(page) => page.params.slug}
	detailRouteID="/[[channel]]/settings/channels/[slug]"
/>

<div>
	{@render children()}
</div>
