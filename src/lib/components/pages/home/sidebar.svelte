<script lang="ts">
	import { ArrowDown, ArrowUp, FilterCog, Icon, type IconType } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { OrderDirection } from '$lib/gql/graphql';
	import { setContext } from 'svelte';
	import CategoriesAccordion from './sidebar-category.svelte';
	import SidebarPriceRange from './sidebar-price-range.svelte';
	import SidebarRating from './sidebar-rating.svelte';
	import { writable } from 'svelte/store';
	import { AppRoute } from '$lib/utils';
	import { orderByField, sortKey } from './common';
	import { page } from '$app/stores';

	const sortingIcons: Record<OrderDirection, IconType> = {
		ASC: ArrowUp,
		DESC: ArrowDown
	};

	let sortDirection = $derived.by(() => {
		let sort = $page.url.searchParams.get(sortKey)?.trim().toUpperCase() as OrderDirection;
		if (!sort || !Object.values(OrderDirection).includes(sort)) sort = OrderDirection.Desc;

		return sort;
	});

	// let sortingDirection = $state(OrderDirection.Desc);

	// const toggleSortingDirection = () => {
	// 	sortingDirection =
	// 		sortingDirection === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc;
	// };
</script>

<div>
	<!-- products filter -->
	<div class="mb-2 sticky top-0 border w-full m-auto bg-white z-10 rounded-md p-2 shadow-sm">
		<div class="flex items-center gap-x-2 gap-y-1.5 flex-wrap">
			<Icon icon={FilterCog} />
			<a
				href={`${AppRoute.HOME}?${sortKey}=${sortDirection === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc}`}
			>
				<Button endIcon={sortingIcons[sortDirection]} size="xs" color="violet">Price</Button>
			</a>
			<!-- <Button endIcon={sortingIcons[sortingDirection]} size="xs" color='violet'>Price</Button> -->
			<!-- <Button endIcon={sortingIcons[sortingDirection]} size="xs" color='violet'>Price</Button> -->
			<!-- <Button endIcon={sortingIcons[sortingDirection]} size="xs" color='violet'>Price</Button> -->
		</div>
	</div>
	<CategoriesAccordion />
	<SidebarRating />
	<SidebarPriceRange onChange={console.log} currency="₫" />
</div>
