<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { productFilterParamStore } from '$lib/stores/app/product-filter';
	import { page } from '$app/stores';
	import { numberRegex, parseUrlSearchParams, setValueByKey } from '$lib/utils/utils';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { orderByField, priceRange, sortKey } from './common';
	import { OrderDirection, ProductOrderField, type QueryProductsArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { get } from 'svelte/store';

	const productFetchBatch = 10;

	afterNavigate(() => {
		if ($page.url.pathname !== AppRoute.HOME) return;

		// const channelSlug = clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug);
		const queryParams = parseUrlSearchParams($page.url);

		let paramsChanged = false;
		const newProductQueryArgs: QueryProductsArgs = {
			...get(productFilterParamStore)
		};

		// parse sort by field:
		let sortDirection = queryParams[sortKey];
		let sortField = queryParams[orderByField];

		if (sortDirection)
			sortDirection = (sortDirection as string).toUpperCase();
		if (sortField && typeof sortField === 'string') sortField = sortField.toUpperCase();

		if (
			(sortDirection !== $productFilterParamStore.sortBy?.direction &&
				Object.values(OrderDirection).includes(sortDirection as OrderDirection)) ||
			(sortField !== $productFilterParamStore.sortBy?.field &&
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
			const priceRangeParams = (priceRangeParam as string).trim().split(',');

			if (priceRangeParams.length && priceRangeParams.every((item) => numberRegex.test(item))) {

				if (priceRanges.length !== newProductQueryArgs.filter)

				paramsChanged = true;
				setValueByKey(newProductQueryArgs, 'filter.price', {
					gte: Number(priceRangeParams[0]),
					lte: priceRangeParams[1] ? Number(priceRangeParams[1]) : null
				});
			}
		}

		console.log(paramsChanged, newProductQueryArgs);

		if (paramsChanged) productFilterParamStore.set(newProductQueryArgs);
	});
</script>

<div class="!hidden"></div>
