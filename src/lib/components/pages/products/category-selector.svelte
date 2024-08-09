<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import type { CategoryCountableConnection, CategoryCountableEdge, Query } from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/stores/api/product';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick } from 'svelte';
	import { tClient } from '$i18n';
	import { scrollToEnd } from '$lib/actions/scroll-end';

	const categoryLevelsMap: Record<number, string> = {
		0: tClient('common.level1'),
		1: tClient('common.level2'),
		2: tClient('common.level3'),
		3: tClient('common.level4'),
		4: tClient('common.level5')
	};
	const NUMBER_OF_CATEGORIES_PER_FETCH = 20;

	let loading = $state(true);
	let categories = $state.frozen<Record<number, CategoryCountableConnection | undefined>>({});
	let categoryLevels = $derived.by(() => Object.keys(categories).map(Number).sort());
	let activeCategoryIndices = $state.frozen<number[]>([]);
	let categoryColumnRefs = $state<HTMLUListElement[]>([]);

	const loadCategories = async (level: number) => {
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
		clickLevel: number /** 0 based */,
		{ node: { children } }: CategoryCountableEdge,
		selectedIndex: number
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
		activeCategoryIndices = [...activeCategoryIndices.slice(0, clickLevel), selectedIndex];
	};

	onMount(async () => {
		await loadCategories(0);
	});
</script>

{#snippet loadingMoreCategories()}
	<li>
		<span class="flex justify-center">
			<span class="loading loading-dots loading-xs"></span>
		</span>
	</li>
{/snippet}

<ul
	class="menu menu-horizontal rounded !flex-nowrap tablet:!flex-wrap w-full max-h-96 tablet:max-h-fit bg-gray-50"
>
	{#each categoryLevels as level, levelIdx (levelIdx)}
		{@const children = categories[level]}
		{#if children}
			<li class="w-1/4 !flex-nowrap tablet:w-1/2 max-h-80">
				<!-- svelte-ignore a11y_missing_attribute -->
				<a class="!pointer-events-none">{categoryLevelsMap[level]}</a>
				<ul
					class="sitename-scrollbar overflow-y-auto overflow-x-hidden"
					use:scrollToEnd={{
						onScrollToEnd: console.log
					}}
				>
					{#each children.edges as edge, categoryIdx (categoryIdx)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
						<li
							role="button"
							tabindex="0"
							onclick={() => handleCategoryClick(level, edge, categoryIdx)}
							class="rounded-md !outline-none"
							class:!bg-blue-100={categoryIdx === activeCategoryIndices[levelIdx]}
							class:!text-blue-600={categoryIdx === activeCategoryIndices[levelIdx]}
						>
							<span>{edge.node.name}</span>
						</li>
					{/each}
					<!--  -->
					{#if loading}
						{@render loadingMoreCategories()}
					{/if}
				</ul>
			</li>
		{/if}
	{/each}
</ul>
