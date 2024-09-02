<script lang="ts">
	import { ArrowDown, ArrowUp, FilterCog, Icon, type IconType } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { OrderDirection, ProductOrderField } from '$lib/gql/graphql';
	import CategoriesAccordion from './sidebar-category.svelte';
	import SidebarPriceRange from './sidebar-price-range.svelte';
	import SidebarRating from './sidebar-rating.svelte';
	import { AppRoute } from '$lib/utils';
	import { orderByField, sortKey } from './common';
	import { page } from '$app/stores';
	import { flipDirection } from '$lib/utils/utils';

	const sortingIcons: Record<OrderDirection, IconType> = {
		ASC: ArrowUp,
		DESC: ArrowDown
	};

	let sortDirection = $derived.by(() => {
		let sort = $page.url.searchParams.get(sortKey)?.trim().toUpperCase() as OrderDirection;
		if (!sort || !Object.values(OrderDirection).includes(sort)) sort = OrderDirection.Desc;

		return sort;
	});

	let productOrderField = $state<ProductOrderField>(ProductOrderField.Price);
</script>

<div>
	<!-- products filter -->
	<div class="mb-2 sticky top-0 border w-full m-auto bg-white z-10 rounded-md p-2 shadow-sm">
		<div class="flex items-center gap-x-2 gap-y-1.5 flex-wrap">
			<Icon icon={FilterCog} />
			<a
				href={`${AppRoute.HOME}?${sortKey}=${flipDirection(sortDirection)}&${orderByField}=${productOrderField}`}
			>
				<Button endIcon={sortingIcons[sortDirection]} size="xs" color="violet">Price</Button>
			</a>
		</div>
	</div>
	<CategoriesAccordion />
	<SidebarPriceRange onChange={console.log} currency="₫" />
	<SidebarRating />
</div>
