<script lang="ts">
	import { T } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const meSupportNewPath = AppRoute.ME_SUPPORT_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.ME_SUPPORT()}
	listingPageLabel={$T('settings.requests')}
	newPageHref={meSupportNewPath}
	newPageLabel={$T('settings.newRequest')}
	detailRouteID="/[[channel]]/settings/supports/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
