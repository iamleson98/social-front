<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import { page } from '$app/stores';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { initialHomePageLoadCounter, ORDER_BY_FIELD, PRICE_RANGE, SORT_KEY } from './common';
	import { OrderDirection, ProductOrderField, type ProductOrder } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { get } from 'svelte/store';

	afterNavigate(() => {
		if ($page.url.pathname !== AppRoute.HOME) return;

		// we only care about the initial page load.
		// since the store is 2 ways binding
		if (!get(initialHomePageLoadCounter)) return;

		initialHomePageLoadCounter.set(false);

		const queryParams = parseUrlSearchParams($page.url);
		const newProductQueryArgs = get(productFilterParamStore);
		// let paramsChanged = false;

		// parse sort by field:
		let sortDirection = queryParams[SORT_KEY];
		let sortField = queryParams[ORDER_BY_FIELD];

		if (sortDirection) sortDirection = (sortDirection as string).toUpperCase();
		if (sortField) sortField = (sortField as string).toUpperCase();

		if (Object.values(OrderDirection).includes(sortDirection as OrderDirection))
			(newProductQueryArgs.sortBy as ProductOrder).direction = sortDirection as OrderDirection;

		if (Object.values(ProductOrderField).includes(sortField as ProductOrderField))
			(newProductQueryArgs.sortBy as ProductOrder).field = sortField as ProductOrderField;

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

<div class="!hidden"></div>
