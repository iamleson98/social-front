<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		OrderDirection,
		PromotionSortField,
		type Query,
		type QueryPromotionsArgs,
	} from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { PROMOTIONS_QUERY } from '$lib/api/discount';
	import { AppRoute } from '$lib/utils';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { FlipTimer } from '$lib/components/common/flip-timer/index';

	const PROMOTION_FIRST = 5;

	const promotionsStore = operationStore<Pick<Query, 'promotions'>, QueryPromotionsArgs>({
		query: PROMOTIONS_QUERY,
		variables: {
			first: PROMOTION_FIRST,
			sortBy: {
				field: PromotionSortField.EndDate,
				direction: OrderDirection.Desc,
			},
		},
		context: {
			url: AppRoute.GRAPHQL_API,
		},
	});
</script>

<div class="space-y-2">
	<div class="flex justify-between text-sm">
		<span class="font-bold text-gray-800">Featured</span>
		<span class="text-xs text-gray-500 italic">
			selected by <span class="text-red-500 font-bold">Sitename</span>
		</span>
	</div>

	<div class={SitenameCommonClassName}>
		{#if $promotionsStore.fetching}
			<div class="space-y-1.5">
				<SelectSkeleton size="xs" />
				<SelectSkeleton size="xs" />
			</div>
		{:else if $promotionsStore.error}
			<Alert variant="warning" size="xs">Failed to load promotions. Please try again later.</Alert>
		{:else if $promotionsStore.data?.promotions}
			{#each $promotionsStore.data.promotions.edges as edge, idx (idx)}
				{@const {
					node: { name, startDate },
				} = edge}
				<div>
					<p class="text-gray-700 text-sm">{edge.node.name}</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
						<!-- <span>{startDate}</span> -->
						{#if edge.node.endDate}
							<FlipTimer />
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<Button size="xs" fullWidth>View all</Button>
</div>
