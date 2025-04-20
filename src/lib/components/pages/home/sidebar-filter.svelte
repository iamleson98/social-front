<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { ArrowDown, ArrowUp, FilterCog, type IconContent } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import {
		OrderDirection,
		ProductOrderField,
		type PriceRangeInput,
		type ProductOrder
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import { flipDirection } from '$lib/utils/utils';
	import { ORDER_BY_FIELD, PRICE_RANGE, ORDER_DIRECTION } from './common';
	import { productFilterParamStore } from '$lib/stores/app/product-filter.svelte';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	type Props = {
		currency: CurrencyCode;
	};

	/** in client side, we only support sorting products by these fields below */
	let PRODUCT_SORT_FIELDS = $derived.by(() =>
		[
			ProductOrderField.Price,
			ProductOrderField.Rating,
			ProductOrderField.Name,
			ProductOrderField.PublicationDate,
			ProductOrderField.MinimalPrice
		].map((value) => ({ value, label: $tranFunc(`common.${value.toLowerCase()}`) }))
	);

	const RATINGS = [5, 4, 3, 2, 1];

	let selectedRating = $state(RATINGS[0]);

	const sortingIcons: Record<OrderDirection, IconContent> = {
		ASC: ArrowUp,
		DESC: ArrowDown
	};

	let { currency }: Props = $props();

	let priceRangeError = $derived.by(() => {
		const { gte, lte } = $productFilterParamStore.filter?.price as PriceRangeInput;
		if (typeof gte !== 'number' || typeof lte !== 'number') return null;

		if (gte < 0 || (lte as number) < 0) return $tranFunc('error.negativeNumber');
		if (gte >= (lte as number)) return $tranFunc('error.startGreaterEnd');

		return null;
	});

	const applyFilter = async () => {
		const filterState = get(productFilterParamStore);
		const searchParams = new URLSearchParams();

		if (filterState.sortBy?.field) {
			searchParams.set(ORDER_BY_FIELD, filterState.sortBy.field);
			searchParams.set(ORDER_DIRECTION, filterState.sortBy.direction);
		}
		if (!priceRangeError && filterState.filter?.price?.gte && filterState.filter?.price?.lte)
			searchParams.set(
				PRICE_RANGE,
				`${filterState.filter?.price?.gte},${filterState.filter?.price?.lte}`
			);

		await goto(`${AppRoute.HOME()}?${searchParams.toString()}`, {
			invalidateAll: false,
			replaceState: false
		});
	};

	const handleOrderingButtonClick = async () => {
		($productFilterParamStore.sortBy as ProductOrder).direction = flipDirection(
			$productFilterParamStore.sortBy?.direction as OrderDirection
		);
	};

	onMount(() => productFilterParamStore.reset); // reset filter params
</script>

<Accordion header={$tranFunc('common.filter')} headerIcon={FilterCog}>
	<!-- MARK: order -->
	<div class="mb-4">
		<div class="text-xs mb-2">{$tranFunc('common.ordering')}</div>
		<div class="flex items-center gap-1">
			<Select
				options={PRODUCT_SORT_FIELDS}
				size="sm"
				bind:value={$productFilterParamStore.sortBy!.field as ProductOrderField}
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

	<!-- MARK; price range filter -->
	<div class="mb-4">
		<div class="text-xs mb-2">{$tranFunc('common.priceRange')}</div>
		<div class="flex items-center gap-2 justify-between mb-1">
			<Input
				placeholder={$tranFunc('common.from')}
				type="number"
				min={0}
				size="sm"
				bind:value={$productFilterParamStore.filter!.price!.gte}
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'info'}
			/>
			<Input
				placeholder={$tranFunc('common.to')}
				type="number"
				min={0}
				size="sm"
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'info'}
				bind:value={$productFilterParamStore.filter!.price!.lte}
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
		<div class="text-xs mb-2">{$tranFunc('common.score')}</div>
		{#each RATINGS as rating, idx (idx)}
			<div class="flex items-center gap-1 mb-1">
				<span class="text-xs font-bold text-blue-600 w-1/4 text-nowrap">
					{rating}
					{$tranFunc('common.star')}
				</span>
				<div class="w-3/4">
					<progress class="progress progress-warning" max="100" value={rating * 20}></progress>
				</div>

				<div>
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
		{$tranFunc('common.filter')}
	</Button>
</Accordion>
