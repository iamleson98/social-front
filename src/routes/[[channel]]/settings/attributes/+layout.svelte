<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newAttributeLink = AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_ATTRIBUTES()}
	listingPageLabel="Attributes"
	newPageHref={newAttributeLink}
	newPageLabel="New attribute"
	detailRouteID="/[[channel]]/settings/attributes/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	backLinkUrl={AppRoute.SETTINGS_CONFIGS()}
/>

<div>
	{@render children()}
</div>

