<script lang="ts">
	import { T } from '$i18n';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { CountDown } from '$lib/components/ui/Countdown';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import { OrderDirection, PromotionSortField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
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
		<span class="font-bold text-gray-800">{$T('home.featured')}</span>
		<span class="text-xs text-gray-500 italic">
			{$T('home.selectedBy')} <span class="text-red-500 font-bold">Sitename</span>
		</span>
	</div>

	<div class={SitenameCommonClassName}>
		{#if Query.loading}
			<div class="space-y-1.5">
				<SelectSkeleton size="xs" />
				<SelectSkeleton size="xs" />
			</div>
		{:else if Query.error}
			<Alert variant="warning" size="xs">{$T('home.promotionsFailedToLoad')}</Alert>
		{:else if Query.current}
			{#each Query.current.edges as edge, idx (idx)}
				<div>
					<p class="text-gray-700 font-medium">{edge.node.name}</p>
					{#if dayjs(edge.node.endDate).isBefore(Now)}
						<span class="text-red-500">{$T('home.promotionEnded')}</span>
					{:else}
						<div class="flex justify-end mt-2">
							<CountDown destination={edge.node.endDate} />
						</div>
					{/if}
				</div>
			{:else}
				<div>{$T('home.noPromotions')}</div>
			{/each}
		{/if}
	</div>

	<a href={AppRoute.TRENDING()}>
		<Button size="sm" aria-label={$T('home.viewAllPromotions')} fullWidth
			>{$T('home.viewAll')}</Button
		>
	</a>
</div>
