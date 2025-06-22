<script lang="ts">
	import { tranFunc } from '$i18n';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const meSupportNewPath = AppRoute.ME_SUPPORT_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.ME_SUPPORT()}
	listingPageLabel={$tranFunc('settings.requests')}
	newPageHref={meSupportNewPath}
	newPageLabel={$tranFunc('settings.newRequest')}
	detailRouteID="/[[channel]]/settings/supports/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
