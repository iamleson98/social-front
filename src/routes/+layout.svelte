<script lang="ts">
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import { page } from '$app/stores';
	import { onMount, type Snippet } from 'svelte';
	import Footer from '$lib/components/common/footer.svelte';
	import { AlertListener } from '$lib/components/ui/Modal';
	import { checkoutStore } from '$lib/stores/app';
	import { getOrInitCheckout } from '$lib/utils/utils';
	import '../app.css';
	import { AppRoute } from '$lib/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(async () => {
		// does not fetch if the page is either checkout or shopping cart
		if (
			$page.route.id &&
			[AppRoute.SHOPPING_CART, `${AppRoute.CHECKOUT}/[id]`].includes($page.route.id)
		)
			return;

		const checkout = await getOrInitCheckout();
		if (checkout) checkoutStore.set(checkout);
	});
</script>

<svelte:head>
	<title>{$page.data.meta?.title || 'Web'} - Sitename</title>
	<!-- <link rel="manifest" href="/manifest.json" /> -->
	<meta name="theme-color" content="currentColor" />

	<!-- TODO: add apple header here -->

	{#if $page.data.meta}
		<meta name="description" content={$page.data.meta.description} />

		<meta property="og:type" content="website" />
		<meta property="og:title" content={$page.data.meta.title} />
		<meta property="og:description" content={$page.data.meta.description} />
		<meta property="og:image" content={$page.data.meta.imageUrl} />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={$page.data.meta.title} />
		<meta name="twitter:description" content={$page.data.meta.description} />
		<meta name="twitter:image" content={$page.data.meta.imageUrl} />
	{/if}
</svelte:head>

<Header />

<main class="pt-16 mx-auto min-h-screen max-w-6xl">
	{@render children()}
</main>

<Footer />
<Toast />
<AlertListener />
