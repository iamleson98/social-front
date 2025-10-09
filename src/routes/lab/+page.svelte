<script lang="ts">
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SelectItemProps } from '$lib/components/ui/MegaMenu/types';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type { Query, QueryCategoriesArgs } from '$lib/gql/graphql';
	import Com from './com.svelte';

	const CategoriesStore = operationStore<
		Pick<Query, 'categories'>,
		QueryCategoriesArgs & { countCatalog?: boolean }
	>({
		query: CATEGORIES_LIST_QUERY,
		variables: {
			countCatalog: false,
			first: 50,
			level: 0,
		},
	});

	let selectedItems = $state<SelectItemProps[]>([]);

	$inspect(selectedItems);
</script>

{#if $CategoriesStore.fetching}
	<TableSkeleton numOfRows={4} numColumns={1} />
{:else if $CategoriesStore.error}
	<Alert variant="error" bordered size="sm">
		{$CategoriesStore.error.message}
	</Alert>
{:else if $CategoriesStore.data?.categories}
	<div class="grid grid-cols-4 gap-1.5 w-full">
		<Com connection={$CategoriesStore.data.categories} bind:selectedItems />
	</div>
{/if}
