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
	listingPageHref={AppRoute.BookingUsers()}
	listingPageLabel="Transport Users"
	newPageHref={AppRoute.BookingUserNew()}
	newPageLabel="New Transport User"
	detailRouteID="/[[channel]]/settings/transport-users/[id]"
	detailPageLabelGetter={(page) => page.params.id}
/>

{@render children()}
