<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_CATEGORIES()}
	listingPageLabel="Categories"
	newPageHref={AppRoute.SETTINGS_CONFIGS_CATEGORY_NEW()}
	newPageLabel="New category"
	detailRouteID="/[[channel]]/settings/configs/categories/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>

