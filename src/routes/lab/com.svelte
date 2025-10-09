<script lang="ts">
	import { scrollToEnd } from '$lib/actions/scroll-end';
	import { CATEGORIES_LIST_QUERY, CATEGORY_CHILDREN_LIST_QUERY } from '$lib/api/admin/category';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { ChevronRight, Icon } from '$lib/components/icons';
	import { type SelectItemProps } from '$lib/components/ui/MegaMenu/types';
	import { TableSkeleton, type CountableConnection } from '$lib/components/ui/Table';
	import type {
		CategoryCountableConnection,
		PageInfo,
		Query,
		QueryCategoriesArgs,
		QueryCategoryArgs,
	} from '$lib/gql/graphql';
	import Comp from './com.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	type Props = {
		connection: CategoryCountableConnection;
		selectedItems: SelectItemProps[];
		disabled?: boolean;
		onSelect?: (item: SelectItemProps) => void;
	};

	let {
		connection,
		selectedItems = $bindable(),
		disabled,
		onSelect,
	}: Props = $props();

	const Batch = 50;

	let pageInfo = $state<PageInfo>(connection.pageInfo);
	let meetMap = new Map<string, boolean>();
	let itemsOptions = $state<SelectItemProps[]>([]);
	let loading = $state(false);
	let activeItemIndex = $state<number>();
	const itemCursorClass = $derived(disabled ? 'cursor-not-allowed!' : 'cursor-pointer');

	const addConnectionToItems = (connection: CategoryCountableConnection) => {
		const addItems: SelectItemProps[] = [];

		for (const edge of connection.edges) {
			if (!meetMap.has(edge.node.id)) {
				meetMap.set(edge.node.id, true);

				addItems.push({
					title: edge.node.name,
					value: edge.node.id,
					level: edge.node.level,
				});
			}
		}
		if (addItems.length) itemsOptions = itemsOptions.concat(addItems);
	};

	onMount(() => {
		addConnectionToItems(connection);
	});

	const fetchNextPage = async () => {
		if (!pageInfo.hasNextPage) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.query<
			Pick<Query, 'categories'>,
			QueryCategoriesArgs & { countCatalog?: boolean }
		>(CATEGORIES_LIST_QUERY, {
			first: Batch,
			countCatalog: false,
		});
		loading = false;

		if (result.error || !result.data?.categories) return;

		pageInfo = result.data.categories.pageInfo;
		addConnectionToItems(result.data.categories);
	};

	const fetchChildren = async (prentId: string) => {
		loading = true;
		const result = await GRAPHQL_CLIENT.query<
			Pick<Query, 'category'>,
			QueryCategoryArgs & { countCatalog?: boolean; first?: number }
		>(CATEGORY_CHILDREN_LIST_QUERY, {
			id: prentId,
			countCatalog: false,
			first: Batch,
		});
		loading = false;

		return result.error || !result.data?.category?.children?.edges.length
			? undefined
			: result.data.category.children;
	};

	const handleSelectItem = async (item: SelectItemProps, idx: number) => {
		activeItemIndex = idx;
		item.children = await fetchChildren(item.value as string);

		const newItems = selectedItems.slice(0, item.level);
		newItems.push(item);
		selectedItems = newItems;
	};
</script>

<div
	class="rounded-lg overflow-y-auto max-h-60 p-2 sitename-scrollbar"
	use:scrollToEnd={{ onScrollToEnd: fetchNextPage }}
>
	{#each itemsOptions as item, idx (idx)}
		{@const colorClasses =
			activeItemIndex === idx
				? 'bg-blue-50 ring-2 text-blue-600 ring-blue-500'
				: 'ring-gray-200 ring-1 text-gray-700 bg-white'}
		<div
			class={`flex items-center select-none justify-between overflow-hidden rounded-lg mb-2 font-medium p-2 ${itemCursorClass} ${colorClasses}`}
			role="button"
			tabindex="0"
			onclick={() => handleSelectItem(item, idx)}
			onkeydown={(evt) => evt.key === 'Enter' && handleSelectItem(item, idx)}
			aria-disabled={disabled}
		>
			<span>{item.title}</span>
			{#if activeItemIndex === idx && item.children}
				<span transition:fly={{ x: -10 }}>
					<Icon icon={ChevronRight} />
				</span>
			{/if}
		</div>
	{/each}
</div>
{#if itemsOptions.length && selectedItems[itemsOptions[0].level]?.children}
	{#key selectedItems[itemsOptions[0].level]?.children}
		<Comp connection={selectedItems[selectedItems.length - 1].children!} bind:selectedItems />
	{/key}
{:else if loading}
	<TableSkeleton numOfRows={4} numColumns={1} headless />
{/if}
