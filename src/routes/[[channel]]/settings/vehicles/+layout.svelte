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
	listingPageHref={AppRoute.BookingVehicles()}
	listingPageLabel="Transport Vehicles"
	newPageHref={AppRoute.BookingVehicleNew()}
	newPageLabel="New Transport Vehicle"
	detailRouteID="/[[channel]]/settings/vehicles/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

{@render children()}
