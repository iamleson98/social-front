<script lang="ts">
	import { page } from '$app/state';
	import { Header } from '$lib/components/common';
	import Footer from '$lib/components/common/footer.svelte';
	import ShopQuery from '$lib/components/common/shop-query.svelte';
	import Language from '$lib/components/plugins/language.svelte';
	import { AlertListener } from '$lib/components/ui/Modal';
	import '../app.css';
	import '@fontsource-variable/inter/wght.css';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { type Snippet } from 'svelte';
	import { Toaster } from 'svelte-sonner';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();

	dayjs.extend(duration);
	dayjs.extend(relativeTime);
</script>

<svelte:head>
	<title>{page.data?.meta?.title || 'Web'} - Sitename</title>
	<meta name="theme-color" content="#2f54eb" />

	<link rel="canonical" href={page.url.origin + page.url.pathname} />
	<meta property="og:url" content={page.url.origin + page.url.pathname} />

	{#if page.data.meta}
		{#if page.data.meta.description}
			<meta name="description" content={page.data.meta.description} />
		{/if}

		<meta property="og:type" content="website" />
		<meta property="og:title" content={page.data.meta.title} />
		{#if page.data.meta.description}
			<meta property="og:description" content={page.data.meta.description} />
			<meta name="twitter:description" content={page.data.meta.description} />
		{/if}
		{#if page.data.meta.imageUrl}
			<meta property="og:image" content={page.data.meta.imageUrl} />
			<meta name="twitter:image" content={page.data.meta.imageUrl} />
		{/if}

		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={page.data.meta.title} />
	{/if}
</svelte:head>

<Header />

<Language />

<ShopQuery />

<!-- sticky-footer layout: content pushes the footer down naturally -->
<div class="flex min-h-screen flex-col">
	<main class="pt-[86px] max-tablet:pt-[132px] mx-auto w-full max-w-[1350px] flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
<AlertListener />
<Toaster position="top-right" duration={3000} />
