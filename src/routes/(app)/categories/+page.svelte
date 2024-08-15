<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import type { Category, PageInfo } from '$lib/gql/graphql';
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/stores/api/product';
	import { preHandleGraphqlResult } from '$lib/utils/utils';

	let loading = $state(true);
	let categories = $state.frozen<Category[]>([]);
	let pageInfo = $state.frozen<PageInfo>({ hasNextPage: false, hasPreviousPage: false });

	$effect(() => {
		const { unsubscribe } = graphqlClient
			.query(CATEGORIES_LIST_QUERY_STORE, {
				first: 10
			})
			.subscribe((result) => {
				if (preHandleGraphqlResult(result)) return;

				if (result.data) {
					categories = result.data.edges.map(({ node }) => node);
					pageInfo = result.data.pageInfo;
				}
				loading = false;
			});

		return unsubscribe;
	});
</script>

<div class="flex flex-row">
	{#if loading}
		{#each new Array(10) as _, idx (idx)}
			<div class="skeleton w-32 h-32"></div>
		{/each}
	{:else}
		{#each categories as category, idx (idx)}
			<div class="flex items-center gap-2">
				<div class="w-12 h-12 bg-gray-200 rounded-full"></div>
				<div>
					<h3>{category.name}</h3>
					<p>{category.description}</p>
				</div>
			</div>
		{/each}
	{/if}
</div>

<slot />
