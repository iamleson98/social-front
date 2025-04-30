<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/config/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newStaffLink = AppRoute.SETTINGS_CONFIGS_STAFF_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_STAFFS()}
	listingPageLabel="Staffs"
	newPageHref={newStaffLink}
	newPageLabel="New staff"
	detailRouteID="/[[channel]]/settings/configs/staffs/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>

