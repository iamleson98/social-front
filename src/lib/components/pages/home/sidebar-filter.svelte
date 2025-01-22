<script lang="ts">
	import { goto } from '$app/navigation';
	import { tClient } from '$i18n';
	import { ArrowDown, ArrowUp, FilterCog, type IconType } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		OrderDirection,
		ProductOrderField,
		type PriceRangeInput,
		type ProductFilterInput,
		type ProductOrder
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import { flipDirection } from '$lib/utils/utils';
	import { ORDER_BY_FIELD, PRICE_RANGE, SORT_KEY } from './common';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import { get } from 'svelte/store';

	type Props = {
		currency: CurrencyCode;
	};

	/** in client side, we only support sorting products by these fields below */
	const ProductSortFields: SelectOption[] = [
		ProductOrderField.Price,
		ProductOrderField.Rating,
		ProductOrderField.Name,
		ProductOrderField.PublicationDate,
		ProductOrderField.MinimalPrice
	].map((value) => ({ value, label: value.toLowerCase().replace('_', ' ') }));

	const RATINGS = [5, 4, 3, 2, 1];

	let selectedRating = $state(RATINGS[0]);

	const sortingIcons: Record<OrderDirection, IconType> = {
		ASC: ArrowUp,
		DESC: ArrowDown
	};

	let { currency }: Props = $props();

	let priceRangeError = $derived.by(() => {
		const { gte, lte } = $productFilterParamStore.filter?.price as PriceRangeInput;
		if (typeof gte !== 'number' || typeof lte !== 'number') return null;

		if (gte < 0 || (lte as number) < 0) return tClient('error.negativeNumber');
		if (gte >= (lte as number)) return tClient('error.startGreaterEnd');

		return null;
	});

	const applyFilter = async () => {
		const filterState = get(productFilterParamStore);
		const searchParams = new URLSearchParams();

		if (filterState.sortBy?.field) {
			searchParams.set(ORDER_BY_FIELD, filterState.sortBy.field);
			searchParams.set(SORT_KEY, filterState.sortBy.direction);
		}
		if (!priceRangeError && filterState.filter?.price?.gte && filterState.filter?.price?.lte)
			searchParams.set(
				PRICE_RANGE,
				`${filterState.filter?.price?.gte},${filterState.filter?.price?.lte}`
			);

		await goto(`${AppRoute.HOME}?${searchParams.toString()}`, {
			invalidateAll: false,
			replaceState: false
		});
	};

	const handleOrderingButtonClick = async () => {
		($productFilterParamStore.sortBy as ProductOrder).direction = flipDirection(
			$productFilterParamStore.sortBy?.direction as OrderDirection
		);
	};
</script>

<Accordion header="Filter" headerIcon={FilterCog}>
	<!-- price order -->
	<div class="mb-4">
		<div class="text-xs mb-2">{tClient('common.ordering')}</div>
		<div class="flex items-center gap-1">
			<Select
				options={ProductSortFields}
				size="sm"
				bind:value={($productFilterParamStore.sortBy as ProductOrder).field as ProductOrderField}
			/>

			<IconButton
				icon={sortingIcons[$productFilterParamStore.sortBy?.direction as OrderDirection]}
				size="sm"
				color="gray"
				onclick={handleOrderingButtonClick}
				aria-label="order by"
			/>
		</div>
	</div>

	<!-- price range filter -->
	<div class="mb-4">
		<div class="text-xs mb-2">{tClient('common.priceRange')}</div>
		<div class="flex items-center gap-2 justify-between mb-1">
			<Input
				placeholder="from"
				type="number"
				min={0}
				size="sm"
				bind:value={
					(($productFilterParamStore.filter as ProductFilterInput).price as PriceRangeInput).gte
				}
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'info'}
			/>
			<Input
				placeholder="to"
				type="number"
				min={0}
				size="sm"
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'info'}
				bind:value={
					(($productFilterParamStore.filter as ProductFilterInput).price as PriceRangeInput).lte
				}
			/>
		</div>
		{#if priceRangeError}
			<Alert class="mt-2" variant="error" size="xs" bordered>
				{priceRangeError}
			</Alert>
		{/if}
	</div>

	<!-- rating filter -->
	<div class="mb-4">
		<div class="text-xs mb-2">{tClient('common.score')}</div>
		{#each RATINGS as rating, idx (idx)}
			<div class="flex items-center gap-1 mb-1">
				<span class="text-xs font-semibold text-blue-600 w-1/4">
					{rating}
					{tClient('common.star')}
				</span>
				<div class="w-3/4">
					<progress class="progress progress-warning min-w-28" max="100" value={rating * 20}></progress>
				</div>

				<div class="ml-1">
					<input
						type="radio"
						name="rating"
						class="radio radio-sm"
						bind:group={selectedRating}
						value={rating}
					/>
				</div>
			</div>
		{/each}
	</div>

	<Button size="xs" fullWidth color="orange" onclick={applyFilter}>
		{tClient('common.filter')}
	</Button>
</Accordion>
