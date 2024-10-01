<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import { page } from '$app/stores';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { orderByField, priceRange, sortKey } from './common';
	import { OrderDirection, ProductOrderField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { get } from 'svelte/store';

	afterNavigate(() => {
		if ($page.url.pathname !== AppRoute.HOME) return;
		const queryParams = parseUrlSearchParams($page.url);

		let paramsChanged = false;
		const newProductQueryArgs = get(productFilterParamStore);

		// parse sort by field:
		let sortDirection = queryParams[sortKey];
		let sortField = queryParams[orderByField];

		if (sortDirection) sortDirection = (sortDirection as string).toUpperCase();
		if (sortField) sortField = (sortField as string).toUpperCase();

		if (
			(sortDirection !== newProductQueryArgs.sortBy?.direction &&
				Object.values(OrderDirection).includes(sortDirection as OrderDirection)) ||
			(sortField !== newProductQueryArgs.sortBy?.field &&
				Object.values(ProductOrderField).includes(sortField as ProductOrderField))
		) {
			paramsChanged = true;

			newProductQueryArgs.sortBy = {
				field: sortField as ProductOrderField,
				direction: sortDirection as OrderDirection
			};
		}

		// parse price range
		const priceRangeParam = queryParams[priceRange];
		if (priceRangeParam) {
			const cleanPriceRangeString = (priceRangeParam as string).replace(/\s/g, '');
			if (
				cleanPriceRangeString !==
				`${newProductQueryArgs.filter?.price?.gte},${newProductQueryArgs.filter?.price?.lte}`
			) {
				const priceRangeSplit = cleanPriceRangeString.split(',');
				if (priceRangeSplit.every((item) => numberRegex.test(item))) {
					paramsChanged = true;
					newProductQueryArgs.filter = {
						price: {
							gte: Number(priceRangeSplit[0]),
							lte: priceRangeSplit[1] ? Number(priceRangeSplit[1]) : null
						}
					};
				}
			}
		}

		if (paramsChanged) productFilterParamStore.set(newProductQueryArgs);
	});
</script>

<div class="!hidden"></div>
