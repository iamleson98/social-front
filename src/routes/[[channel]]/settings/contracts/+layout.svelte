<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { tranFunc } from '$i18n';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const newContractPath = AppRoute.SETTINGS_CONTRACTS_NEW();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONTRACTS()}
	listingPageLabel={$tranFunc('settings.contracts')}
	newPageHref={newContractPath}
	newPageLabel="New Contract"
	detailRouteID="/[[channel]]/settings/contracts/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

<div>
	{@render children()}
</div>
