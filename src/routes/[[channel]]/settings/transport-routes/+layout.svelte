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
	listingPageHref={AppRoute.BookingRoutes()}
	listingPageLabel="Transport Routes"
	newPageHref={AppRoute.BookingRouteNew()}
	newPageLabel="New Transport Route"
	detailRouteID="/[[channel]]/settings/transport-routes/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

{@render children()}
