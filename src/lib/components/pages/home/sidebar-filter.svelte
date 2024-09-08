<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { tClient } from '$i18n';
	import { ArrowDown, ArrowUp, FilterCog, type IconType } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Progress } from '$lib/components/ui/Progress';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { OrderDirection, ProductOrderField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CurrencyIconMap, type Currency } from '$lib/utils/consts';
	import { flipDirection } from '$lib/utils/utils';
	import { orderByField, priceRange, sortKey } from './common';

	type RangeState = {
		from: number;
		to: number;
	};

	type Props = {
		currency: Currency;
	};

	/** in client side, we only support sorting productsby these fields below */
	const ProductSortFields: SelectOption[] = [
		ProductOrderField.Price,
		ProductOrderField.Rating,
		ProductOrderField.Name,
		ProductOrderField.PublicationDate,
		ProductOrderField.MinimalPrice
	].map((value) => ({ value, label: value.toLowerCase().replace('_', ' ') }));

	const ratings = [5, 4, 3, 2, 1];
	const sortingIcons: Record<OrderDirection, IconType> = {
		ASC: ArrowUp,
		DESC: ArrowDown
	};

	let { currency }: Props = $props();

	let priceRangeValues = $state<RangeState>({ from: 0, to: 1 });
	let productOrderField = $state(ProductOrderField.Price);
	let fieldSortDirection = $state(OrderDirection.Desc);

	let priceRangeError = $derived.by(() => {
		if (priceRangeValues.from < 0 || priceRangeValues.to < 0)
			return tClient('error.negativeNumber');
		if (priceRangeValues.from >= priceRangeValues.to) return tClient('error.startGreaterEnd');
		return null;
	});

	afterNavigate(async () => {
		const sort = $page.url.searchParams.get(sortKey)?.trim().toUpperCase() as OrderDirection;
		if (sort !== fieldSortDirection && Object.values(OrderDirection).includes(sort)) {
			fieldSortDirection = sort;
		}
	});

	const applyFilter = async () => {
		const searchParams = new URLSearchParams();
		if (productOrderField) {
			searchParams.set(orderByField, productOrderField);
			searchParams.set(sortKey, fieldSortDirection);
		}
		if (!priceRangeError)
			searchParams.set(priceRange, `${priceRangeValues.from},${priceRangeValues.to}`);

		await goto(`${AppRoute.HOME}?${searchParams.toString()}`, {
			invalidateAll: false,
			replaceState: true
		});
	};
</script>

<Accordion header="Filter" headerIcon={FilterCog}>
	<!-- price order -->
	<div class="mb-4">
		<div class="text-xs mb-2">Order by</div>
		<div class="mb-1 flex items-center gap-1">
			<Select
				options={ProductSortFields}
				size="sm"
				onSelect={(opt) => {
					if (opt) productOrderField = opt.value as ProductOrderField;
				}}
			/>

			<IconButton
				icon={sortingIcons[fieldSortDirection]}
				size="xs"
				color="gray"
				onclick={() => (fieldSortDirection = flipDirection(fieldSortDirection))}
			/>
		</div>
	</div>

	<!-- price range filter -->
	<div class="mb-4">
		<div class="text-xs mb-2">Price range</div>
		<div class="flex items-center gap-2 justify-between mb-1">
			<Input
				placeholder="from"
				type="number"
				min={0}
				size="sm"
				bind:value={priceRangeValues.from}
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'normal'}
			/>
			<Input
				placeholder="to"
				type="number"
				min={0}
				size="sm"
				startIcon={CurrencyIconMap[currency]}
				variant={priceRangeError ? 'error' : 'normal'}
				bind:value={priceRangeValues.to}
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
		<div class="text-xs mb-2">Score rating</div>
		{#each ratings as rating, idx (idx)}
			<div class="flex items-center space-x-2 mb-1.5">
				<span class="text-xs font-semibold text-blue-600 w-1/4">{rating} Star</span>
				<div class="w-3/4">
					<Progress percent={rating * 20} />
				</div>
			</div>
		{/each}
	</div>

	<Button size="xs" fullWidth color="orange" onclick={applyFilter}>Filter</Button>
</Accordion>
