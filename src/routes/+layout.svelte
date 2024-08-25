<script lang="ts">
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/common/footer.svelte';
	import '../app.css';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
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

<noscript
	class="absolute z-[1000] flex h-screen place-content-center place-items-center bg-immich-bg dark:bg-immich-dark-bg dark:text-immich-dark-fg"
>
	<p>To use Sitename, you must enable JavaScript or use a JavaScript compatible browser.</p>
</noscript>

<Header />

<main class="mt-16 mx-auto min-h-screen">
	{@render children()}
</main>

<Footer />
<Toast />
