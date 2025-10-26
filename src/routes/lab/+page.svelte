<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SelectItemProps } from '$lib/components/ui/MegaMenu/types';
	import { Table, TableSkeleton, type TableCellProps } from '$lib/components/ui/Table';
	import type { Query, QueryCategoriesArgs } from '$lib/gql/graphql';
	import Com from '../../lib/components/pages/settings/products/category-menu.svelte';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	// const CategoriesStore = operationStore<
	// 	Pick<Query, 'categories'>,
	// 	QueryCategoriesArgs & { countCatalog?: boolean }
	// >({
	// 	query: CATEGORIES_LIST_QUERY,
	// 	variables: {
	// 		countCatalog: false,
	// 		first: 50,
	// 		level: 0,
	// 	},
	// });

	// let selectedItems = $state<SelectItemProps[]>([]);

	const computeStyle = async () => {
		if (!triggerRef || !menuElemRef) return;
		const { x, y } = await computePosition(triggerRef, menuElemRef, {
			placement: 'bottom-start',
			middleware: [offset(4), flip(), shift()],
		});

		Object.assign(menuElemRef.style, {
			left: `${x}px`,
			top: `${y}px`,
		});
	};

	onMount(async () => {
		await computeStyle();
	});

	// $inspect(selectedItems);

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();
	// let open = $state(false);

	const items = new Array(100)
		.fill(0)
		.map((_, idx) => ({ id: idx.toString(), name: `Category ${idx}` }));
</script>

{#snippet name({ item }: TableCellProps<{ id: string; name: string }>)}
	{item.name}
{/snippet}

<Table
	{items}
	columns={[
		{
			title: 'Name',
			child: name,
		},
	]}
	restPagination={{
		totalCount: 100,
		rowsPerPage: 10,
	}}
/>

