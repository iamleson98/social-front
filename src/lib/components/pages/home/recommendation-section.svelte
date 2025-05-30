<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Query, QueryPromotionArgs } from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { PROMOTIONS_QUERY } from '$lib/api/discount';
	import { AppRoute } from '$lib/utils';

	const PROMOTION_FIRST = 4;

	let promotionEndCursor = $state<string | null>(null);

	const promotionsStore = operationStore<Pick<Query, 'promotions'>, QueryPromotionArgs>({
		kind: 'query',
		query: PROMOTIONS_QUERY,
		variables: {
			first: PROMOTION_FIRST,
			after: (() => (promotionEndCursor ? promotionEndCursor : undefined))()
		},
		context: {
			url: AppRoute.GRAPHQL_API
		}
	});
</script>

{#snippet promotionsLoading()}
	<div>
		<SkeletonContainer>
			<Skeleton class="h-3 block w-full mb-1" />
			<Skeleton class="h-3 block w-1/2 mb-2" />
		</SkeletonContainer>
	</div>
{/snippet}

<div class="max-w-md w-full p-1">
	<div class="flex justify-between mb-2 text-sm">
		<span class="font-bold text-gray-800">Featured</span>
		<span class="text-xs text-gray-500 italic">
			selected by <span class="text-red-500 font-bold">Sitename</span>
		</span>
	</div>

	<div class="bg-white rounded-md p-4 mb-4">
		{#if $promotionsStore.fetching}
			{@render promotionsLoading()}
			{@render promotionsLoading()}
		{:else if $promotionsStore.error}
			<Alert variant="warning" size="xs" bordered>
				Failed to load promotions. Please try again later.
			</Alert>
		{:else if $promotionsStore.data?.promotions}
			{#each $promotionsStore.data.promotions.edges as edge, idx (idx)}
				{@const {
					node: { name, startDate }
				} = edge}
				<div>
					<p class="text-gray-700 text-sm">{name}</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
						<span>{startDate}</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<Button size="sm" fullWidth>View all</Button>
</div>
