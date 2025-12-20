<script lang="ts">
	import { T } from '$i18n';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { AppRoute } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONES()}
	listingPageLabel={$T('channel.shipZones')}
	newPageHref={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_NEW()}
	newPageLabel={$T('channel.addShipZone')}
	detailPageLabelGetter={(page) => page.params.id}
	detailRouteID="/[[channel]]/settings/shipping-zones/[id]"
/>

<div>
	{@render children()}
</div>
