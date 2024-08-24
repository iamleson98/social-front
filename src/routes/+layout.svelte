<script lang="ts">
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import '../app.css';
	import { graphqlClient } from '$lib/client';
	import { USER_ME_QUERY_STORE } from '$lib/stores/api';
	import type { Query } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import Footer from '$lib/components/common/footer.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	$effect.pre(() => {
		const { unsubscribe } = graphqlClient
			.query<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, { requestPolicy: 'network-only' })
			.subscribe((result) => {
				if (preHandleGraphqlResult(result)) {
					return;
				}

				userStore.set(result.data?.me);
			});

		return unsubscribe;
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

<noscript
	class="absolute z-[1000] flex h-screen place-content-center place-items-center bg-immich-bg dark:bg-immich-dark-bg dark:text-immich-dark-fg"
>
	<p>To use Sitename, you must enable JavaScript or use a JavaScript compatible browser.</p>
</noscript>

<Header />

<main class="pt-16 m-auto min-h-screen">
	{@render children()}
</main>

<Footer />
<Toast />
