<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { productFilterParamStore } from '$lib/stores/app/product-filter.svelte';
	import { page } from '$app/state';
	import { NUMBER_REGEX, parseUrlSearchParams } from '$lib/utils/utils';
	import { AFTER, BEFORE, FIRST, LAST, ORDER_BY_FIELD, PRICE_RANGE, ORDER_DIRECTION } from './common';
	import { OrderDirection, ProductOrderField } from '$lib/gql/graphql';
	import { get } from 'svelte/store';

	afterNavigate(async () => {
		const queryParams = parseUrlSearchParams(page.url);
		const newProductQueryArgs = get(productFilterParamStore);

		// parse sort by field:
		let sortDirection = queryParams[ORDER_DIRECTION]
			? (queryParams[ORDER_DIRECTION] as string).toUpperCase()
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

			if (priceRangeSplit.every((item) => NUMBER_REGEX.test(item))) {
				newProductQueryArgs.filter = {
					price: {
						gte: Number(priceRangeSplit[0]),
						lte: priceRangeSplit[1] ? Number(priceRangeSplit[1]) : null
					}
				};
			}
		}

		// before, after
		const before = queryParams[BEFORE];
		const after = queryParams[AFTER];
		if (before) {
			newProductQueryArgs.before = before as string;
			newProductQueryArgs.after = null;
		} else if (after) {
			newProductQueryArgs.after = after as string;
			newProductQueryArgs.before = null;
		}

		// first, last
		const first = queryParams[FIRST];
		const last = queryParams[LAST];
		if (first) {
			newProductQueryArgs.first = Number(first);
			newProductQueryArgs.last = null;
		} else if (last) {
			newProductQueryArgs.last = Number(last);
			newProductQueryArgs.first = null;
		}

		newProductQueryArgs.reload = true;
		productFilterParamStore.set(newProductQueryArgs);
	});
</script>

<div class="hidden!"></div>
