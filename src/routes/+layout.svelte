<script lang="ts">
	import { Header } from '$lib/components/common';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import Footer from '$lib/components/common/footer.svelte';
	import { AlertListener } from '$lib/components/ui/Modal';
	import '../app.css';
	import Language from '$lib/components/plugins/language.svelte';
	import { Toaster } from 'svelte-sonner';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import ShopQuery from '$lib/components/common/shop-query.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(async () => {
		dayjs.extend(relativeTime);
	});
</script>

<svelte:head>
	<title>{page.data?.meta?.title || 'Web'} - Sitename</title>
	<!-- <link rel="manifest" href="/manifest.json" /> -->
	<meta name="theme-color" content="currentColor" />

	<!-- TODO: add apple header here -->

	{#if page.data.meta}
		<meta name="description" content={page.data.meta.description} />

		<meta property="og:type" content="website" />
		<meta property="og:title" content={page.data.meta.title} />
		<meta property="og:description" content={page.data.meta.description} />
		<meta property="og:image" content={page.data.meta.imageUrl} />

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={page.data.meta.title} />
		<meta name="twitter:description" content={page.data.meta.description} />
		<meta name="twitter:image" content={page.data.meta.imageUrl} />
	{/if}
</svelte:head>

<Header />

<Language />

<ShopQuery />

<main class="pt-16 mx-auto min-h-screen max-w-[1350px]">
	{@render children()}
</main>

<Footer />
<AlertListener />
<Toaster richColors />
