<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { CountDown } from '$lib/components/ui/Countdown';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { OrderDirection, PromotionSortField } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { getPromotions } from './promotions.remote';
	import dayjs from 'dayjs';

	const Query = getPromotions({
		first: 5,
		sortBy: {
			field: PromotionSortField.EndDate,
			direction: OrderDirection.Desc,
		},
	});

	const Now = dayjs();
</script>

<div class="space-y-2">
	<div class="flex justify-between text-sm">
		<span class="font-bold text-gray-800">Featured</span>
		<span class="text-xs text-gray-500 italic">
			selected by <span class="text-red-500 font-bold">Sitename</span>
		</span>
	</div>

	<div class={SitenameCommonClassName}>
		{#if Query.loading}
			<div class="space-y-1.5">
				<SelectSkeleton size="xs" />
				<SelectSkeleton size="xs" />
			</div>
		{:else if Query.error}
			<Alert variant="warning" size="xs">Failed to load promotions. Please try again later.</Alert>
		{:else if Query.current}
			{#each Query.current.edges as edge, idx (idx)}
				<div>
					<p class="text-gray-700 font-medium">{edge.node.name}</p>
					{#if dayjs(edge.node.endDate).isBefore(Now)}
						<span class="text-red-500">Promotion ended</span>
					{:else}
						<div class="flex justify-end mt-2">
							<CountDown destination={edge.node.endDate} />
						</div>
					{/if}
				</div>
			{:else}
				<div>No promotions</div>
			{/each}
		{/if}
	</div>

	<Button size="sm" aria-label="View all promotions" fullWidth>View all</Button>
</div>
