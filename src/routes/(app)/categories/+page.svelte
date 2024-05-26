<script lang="ts">
	import type { CategoryCountableEdge, PageInfo } from '$lib/gql/graphql';
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/stores/api/product';
	import { toastStore } from '$lib/stores/ui/toast';
	import { onMount } from 'svelte';

	let loading = true;
	let categories = [] as CategoryCountableEdge[];
	let pageInfo = {} as PageInfo;

	onMount(async () => {
		loading = true;
		const categoriesResult = await CATEGORIES_LIST_QUERY_STORE.fetch({
			variables: {}
		});

		if (categoriesResult.errors?.length) {
			toastStore.send({
				variant: 'error',
				message: categoriesResult.errors[0].message
			});
			return;
		}

		loading = false;

		pageInfo = categoriesResult.data?.categories?.pageInfo as PageInfo;
		categories = categoriesResult.data?.categories?.edges as CategoryCountableEdge[];
	});
</script>

<svelte:head>
	<title>Categories</title>
</svelte:head>

<div class="flex flex-row">
	{#if loading}
		{#each new Array(10) as _, idx (idx)}
			<div class="skeleton w-32 h-32"></div>
		{/each}
	{:else}
		{#each categories as category (category.cursor)}
			<div class="flex items-center gap-2">
				<div class="w-12 h-12 bg-gray-200 rounded-full"></div>
				<div>
					<h3>{category.node.name}</h3>
					<p>{category.node.description}</p>
				</div>
			</div>
		{/each}
	{/if}
</div>

<slot />
