<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { CATEGORIES_LIST_QUERY } from '$lib/api/admin/category';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import type { SelectItemProps } from '$lib/components/ui/MegaMenu/types';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type { Query, QueryCategoriesArgs } from '$lib/gql/graphql';
	import Com from './com.svelte';
	import { computePosition, flip, offset, shift } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const CategoriesStore = operationStore<
		Pick<Query, 'categories'>,
		QueryCategoriesArgs & { countCatalog?: boolean }
	>({
		query: CATEGORIES_LIST_QUERY,
		variables: {
			countCatalog: false,
			first: 50,
			level: 0,
		},
	});

	let selectedItems = $state<SelectItemProps[]>([]);

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
</script>

<!-- {#if $CategoriesStore.fetching}
	<TableSkeleton numOfRows={4} numColumns={1} />
{:else if $CategoriesStore.error}
	<Alert variant="error" bordered size="sm">
		{$CategoriesStore.error.message}
	</Alert>
{:else if $CategoriesStore.data?.categories}
	<div class="grid grid-cols-4 gap-1.5 w-full">
		<Com connection={$CategoriesStore.data.categories} bind:selectedItems />
	</div>
{/if} -->

<div bind:this={triggerRef} class="p-2 bg-green-200 border border-gray-200">open here</div>

<div class="h-dvh border border-gray-200 bg-red-200"></div>

<div
	class="fixed z-100 bg-black text-white h-20 w-20 border border-gray-200 shadow-md"
	bind:this={menuElemRef}
>
	lol
</div>
