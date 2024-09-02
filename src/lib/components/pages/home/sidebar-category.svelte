<script lang="ts">
	import { tClient } from '$i18n';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Accordion, AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { CategoryCountableEdge, Query, QueryCategoriesArgs } from '$lib/gql/graphql';
	import { CATEGORIES_LIST_QUERY_STORE, operationStore } from '$lib/stores/api';
	import { AppRoute } from '$lib/utils';

	const cateLevel = 0;
	const first = 50;

	const categoryStore = operationStore<Pick<Query, 'categories'>, QueryCategoriesArgs>({
		kind: 'query',
		query: CATEGORIES_LIST_QUERY_STORE,
		variables: { level: cateLevel, first }
	});
</script>

{#snippet category({ node }: CategoryCountableEdge)}
	<a
		href={`${AppRoute.CATEGORIES}/${encodeURIComponent(node.slug)}`}
		class="block p-2 rounded-md bg-violet-100 hover:bg-violet-200 transition-colors"
	>
		<div class="flex items-center gap-2">
			<img
				src={node.backgroundImage?.url}
				alt={node.backgroundImage?.alt || node.name}
				class="rounded-md h-6 w-6"
			/>
			<span>{node.name}</span>
		</div>
	</a>
{/snippet}

{#snippet categorySkeleton()}
	<SkeletonContainer class="mb-2">
		<div class="flex items-center gap-1">
			<Skeleton class="rounded-lg w-8 h-8"></Skeleton>
			<Skeleton class="h-4 w-2/3"></Skeleton>
		</div>
	</SkeletonContainer>
{/snippet}

{#if $categoryStore.fetching}
	<Accordion header="Categories">
		{@render categorySkeleton()}
		{@render categorySkeleton()}
		{@render categorySkeleton()}
	</Accordion>
{:else if $categoryStore.error}
	<Alert size="sm" bordered variant="warning">
		{tClient('error.failedToLoad')}
	</Alert>
{:else if $categoryStore.data?.categories?.edges.length}
	<AccordionList
		header="Categories"
		items={$categoryStore.data?.categories?.edges}
		partialDisplay={5}
		child={category}
	/>
{/if}
