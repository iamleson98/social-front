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
	listingPageHref={AppRoute.BookingTrips()}
	listingPageLabel="Transport Trips"
	newPageHref={AppRoute.BookingTripNew()}
	newPageLabel="New Transport Trip"
	detailRouteID="/[[channel]]/settings/transport-trips/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

{@render children()}
