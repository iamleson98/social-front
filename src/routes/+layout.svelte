<script lang="ts">
	import { page } from '$app/state';
	import { Header } from '$lib/components/common';
	import Footer from '$lib/components/common/footer.svelte';
	import Language from '$lib/components/plugins/language.svelte';
	import { AlertListener } from '$lib/components/ui/Modal';
	import '../app.css';
	import '@fontsource-variable/inter/wght.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { type Snippet } from 'svelte';
	import { Toaster } from 'svelte-french-toast';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	dayjs.extend(duration);
	dayjs.extend(relativeTime);

	export const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
				refetchInterval: false,
			},
		},
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

<!-- <ShopQuery /> -->

<QueryClientProvider client={queryClient}>
	{@render children()}
	<main class="pt-16 mx-auto min-h-screen max-w-[1350px]">
		{@render children()}
	</main>
</QueryClientProvider>

<Footer />
<AlertListener />
<Toaster position="top-right" toastOptions={{ duration: 3000 }} />
