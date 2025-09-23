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
	listingPageHref={AppRoute.SETTINGS_CONFIGS_GIFTCARDS()}
	listingPageLabel={$tranFunc('giftcard.title')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_GIFTCARD_NEW()}
	newPageLabel={$tranFunc('giftcard.newIssue')}
	detailRouteID="/[[channel]]/settings/giftcards/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
