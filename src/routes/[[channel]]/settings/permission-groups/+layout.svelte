<script lang="ts">
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS()}
	listingPageLabel={'Permission groups'}
	newPageHref={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_NEW()}
	newPageLabel={'New permission group'}
	detailRouteID="/[[channel]]/settings/permission-groups/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
