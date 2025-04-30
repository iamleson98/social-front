<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newCollectionLink = AppRoute.SETTINGS_CONFIGS_COLLECTION_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_COLLECTIONS()}
	listingPageLabel="Collections"
	newPageHref={newCollectionLink}
	newPageLabel="New collection"
	detailRouteID="/[[channel]]/settings/configs/collections/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>

