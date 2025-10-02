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
	listingPageHref={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUPS()}
	listingPageLabel={$tranFunc('permissionGroup.permGroups')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_NEW()}
	newPageLabel={$tranFunc('permissionGroup.newGroup')}
	detailRouteID="/[[channel]]/settings/permission-groups/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
