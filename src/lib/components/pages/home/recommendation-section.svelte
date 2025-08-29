<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		OrderDirection,
		PromotionSortField,
		type PromotionCountableConnection,
		type QueryPromotionsArgs,
	} from '$lib/gql/graphql';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { FlipTimer } from '$lib/components/common/flip-timer/index';
	import { onMount } from 'svelte';

	const PROMOTION_FIRST = 5;

	let promotions = $state<PromotionCountableConnection>();
	let loading = $state(true);
	let showError = $state(false);

	onMount(async () => {
		const result = await fetch('/api/promotions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				first: PROMOTION_FIRST,
				sortBy: {
					field: PromotionSortField.EndDate,
					direction: OrderDirection.Desc,
				},
			} as QueryPromotionsArgs),
		});

		loading = false;

		if (result.ok) {
			const data = await result.json();
			promotions = data.promotions;
		} else {
			showError = true;
		}
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
		{#if loading}
			<div class="space-y-1.5">
				<SelectSkeleton size="xs" />
				<SelectSkeleton size="xs" />
			</div>
		{:else if showError}
			<Alert variant="warning" size="xs">Failed to load promotions. Please try again later.</Alert>
		{:else if promotions}
			{#each promotions.edges as edge, idx (idx)}
				<div>
					<p class="text-gray-700 text-sm">{edge.node.name}</p>
					<div class="flex text-gray-500 text-xs mt-2 space-x-4">
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
