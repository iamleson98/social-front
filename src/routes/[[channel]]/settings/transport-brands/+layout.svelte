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
	listingPageHref={AppRoute.BookingTransportBrands()}
	listingPageLabel="Transport Brands"
	newPageHref={AppRoute.BookingTransportBrandNew()}
	newPageLabel="New Transport Brand"
	detailRouteID="/[[channel]]/settings/transport-brands/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

{@render children()}
