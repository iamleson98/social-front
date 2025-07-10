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
	listingPageHref={AppRoute.SETTINGS_CONFIGS_STAFFS()}
	listingPageLabel={$tranFunc('staff.staffs')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_STAFF_NEW()}
	newPageLabel={$tranFunc('staff.newStaff')}
	detailRouteID="/[[channel]]/settings/staffs/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
