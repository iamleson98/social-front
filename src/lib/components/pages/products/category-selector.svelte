<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import type { CategoryCountableConnection, CategoryCountableEdge, Query } from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/stores/api/product';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick } from 'svelte';
	import SelectorColumn from './category-selector-level-column.svelte';

	let loading = $state(false);
	let categories = $state.frozen<Record<number, CategoryCountableConnection | undefined>>({});
	let categoryLevels = $derived.by(() => Object.keys(categories).map(Number).sort());
	const NUMBER_OF_CATEGORIES_PER_FETCH = 20;

	const loadCategories = async (level: number) => {
		loading = true;

		let variables: CategoryListForCreateProductInput = {
			level,
			first: NUMBER_OF_CATEGORIES_PER_FETCH
		};

		const fetchResult = await graphqlClient
			.query<Pick<Query, 'categories'>>(CATEGORIES_LIST_FOR_CREATE_PRODUCT, variables)
			.toPromise();

		loading = false;

		if (preHandleGraphqlResult(fetchResult)) {
			return;
		}

		if (fetchResult.data?.categories) {
			categories = {
				...categories,
				[level]: fetchResult.data.categories
			};
		}

		tick();
	};

	const handleCategoryClick = (
		clickLevel: number,
		{ node: { children } }: CategoryCountableEdge
	) => {
		const tempCategories = {
			...categories,
			[clickLevel + 1]: children && children.edges.length ? children : undefined
		};
		let i = clickLevel + 2;
		while (Object.prototype.hasOwnProperty.call(tempCategories, i)) {
			delete tempCategories[i];
			i++;
		}
		categories = tempCategories;
	};

	onMount(() => {
		// we initially load the first level of categories
		const unsub = loadCategories(0);

		return unsub;
	});
</script>

<ul class="menu menu-horizontal rounded !flex-nowrap w-full max-h-96 bg-gray-50">
	{#each categoryLevels as level, idx (idx)}
		{@const children = categories[level]}
		{#if children}
			<SelectorColumn {level} {children} onActivateIndex={handleCategoryClick} />
		{/if}
	{/each}
</ul>
