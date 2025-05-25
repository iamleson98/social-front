<script lang="ts">
	import { PUBLIC_GRAPHQL_API_END_POINT } from '$env/static/public';
	import { getCookieByKey } from '$lib/utils';
	import { ACCESS_TOKEN_KEY } from '$lib/utils/consts';
	import { onMount } from 'svelte';

	let container = $state<HTMLDivElement>();

	// Update the fetcher to use the MMCSRF token
	onMount(() => {
		const fetcher = GraphiQL.createFetcher({
			url: PUBLIC_GRAPHQL_API_END_POINT,
			headers: { Authorization: `Bearer ${getCookieByKey(ACCESS_TOKEN_KEY)}` },
		});
		const root = ReactDOM.createRoot(container);
		const explorerPlugin = GraphiQLPluginExplorer.explorerPlugin();
		root.render(
			React.createElement(GraphiQL, {
				fetcher,
				defaultEditorToolsVisibility: true,
				plugins: [explorerPlugin],
			}),
		);
	});
</script>

<svelte:head>
	<title>GraphiQL</title>
	<style>
		body {
			height: 100%;
			margin: 0;
			width: 100%;
			overflow: hidden;
		}

		#graphiql {
			height: 100vh;
		}
	</style>
	<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
	<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
	<script src="https://unpkg.com/graphiql/graphiql.min.js" type="application/javascript"></script>
	<link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
	<script src="https://unpkg.com/@graphiql/plugin-explorer/dist/index.umd.js" crossorigin></script>

	<link rel="stylesheet" href="https://unpkg.com/@graphiql/plugin-explorer/dist/style.css" />
</svelte:head>

<div class="fixed w-full left-0 right-0 bottom-0 h-full" bind:this={container}>Loading...</div>
