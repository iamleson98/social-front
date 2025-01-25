<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import { page } from '$app/state';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { ORDER_BY_FIELD, PRICE_RANGE, SORT_KEY } from './common';
	import { OrderDirection, ProductOrderField } from '$lib/gql/graphql';
	import { get } from 'svelte/store';

	afterNavigate(() => {
		const queryParams = parseUrlSearchParams(page.url);
		const newProductQueryArgs = get(productFilterParamStore);

		// parse sort by field:
		let sortDirection = queryParams[SORT_KEY]
			? (queryParams[SORT_KEY] as string).toUpperCase()
			: OrderDirection.Asc;
		let sortField = queryParams[ORDER_BY_FIELD]
			? (queryParams[ORDER_BY_FIELD] as string).toUpperCase()
			: ProductOrderField.Price;

		newProductQueryArgs.sortBy!.direction = Object.values(OrderDirection).includes(
			sortDirection as OrderDirection
		)
			? (sortDirection as OrderDirection)
			: OrderDirection.Asc;
		newProductQueryArgs.sortBy!.field = Object.values(ProductOrderField).includes(
			sortField as ProductOrderField
		)
			? (sortField as ProductOrderField)
			: ProductOrderField.Price;

		// parse price range
		const priceRangeParam = queryParams[PRICE_RANGE];
		if (priceRangeParam) {
			const priceRangeSplit = (priceRangeParam as string)
				.replace(/\s+/g, '')
				.split(',')
				.filter(Boolean);

			if (priceRangeSplit.every((item) => numberRegex.test(item))) {
				newProductQueryArgs.filter = {
					price: {
						gte: Number(priceRangeSplit[0]),
						lte: priceRangeSplit[1] ? Number(priceRangeSplit[1]) : null
					}
				};
			}
		}

		newProductQueryArgs.reload = true;
		productFilterParamStore.set(newProductQueryArgs);
	});
</script>

<div class="hidden!"></div>
