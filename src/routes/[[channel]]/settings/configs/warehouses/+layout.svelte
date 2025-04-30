<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newWarehouseLink = AppRoute.SETTINGS_CONFIGS_WAREHOUSE_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_WAREHOUSES()}
	listingPageLabel="Warehouses"
	newPageHref={newWarehouseLink}
	newPageLabel="New warehouse"
	detailPageLabelGetter={(page) => page.params.id}
	detailRouteID="/[[channel]]/settings/configs/warehouses/[id]"
/>

<div>
	{@render children()}
</div>
