<script lang="ts">
	import { tClient } from '$i18n';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Category } from '$lib/components/icons';
	import { Accordion, AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { CategoryCountableEdge, Query, QueryCategoriesArgs } from '$lib/gql/graphql';
	import { CATEGORIES_LIST_QUERY_STORE } from '$lib/stores/api';
	import { operationStore } from '$lib/stores/api/operation';
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
		class="block p-2 rounded-md bg-white border border-gray-200"
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
	<div class="rounded-md border border-gray-200 bg-white mb-2">
		<SkeletonContainer class="flex items-center gap-1">
			<Skeleton class="w-7 h-7 rounded-full"></Skeleton>
			<Skeleton class="h-4 w-2/3"></Skeleton>
		</SkeletonContainer>
	</div>
{/snippet}

{#if $categoryStore.fetching}
	<Accordion header={tClient('common.categories')} headerIcon={Category}>
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
		header={tClient('common.categories')}
		headerIcon={Category}
		items={$categoryStore.data?.categories?.edges}
		partialDisplay={5}
		child={category}
		class="mb-2"
	/>
{/if}
