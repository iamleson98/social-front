<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import type {
		Category,
		CategoryCountableConnection,
		CategoryCountableEdge,
		Query
	} from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/stores/api/admin/product';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { onMount, tick } from 'svelte';
	import { tClient } from '$i18n';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		onCategorySelected: (category: Category | null) => void;
	};

	let { onCategorySelected }: Props = $props();

	const categoryLevelsMap: Record<number, string> = {
		0: tClient('common.level1'),
		1: tClient('common.level2'),
		2: tClient('common.level3'),
		3: tClient('common.level4'),
		4: tClient('common.level5')
	};
	const NUMBER_OF_CATEGORIES_PER_FETCH = 30;

	let initialLoading = $state(true);
	let categories = $state.frozen<Record<number, CategoryCountableConnection | undefined>>({});
	let categoryLevels = $derived.by(() => Object.keys(categories).map(Number).sort());
	/** selected category indices for each level */
	let activeCategoryIndices = $state.frozen<number[]>([]);
	let categoryChoosen = $state<Category | null>(null);

	const loadCategories = async (level: number) => {
		let variables: CategoryListForCreateProductInput = {
			level,
			first: NUMBER_OF_CATEGORIES_PER_FETCH
		};

		const fetchResult = await graphqlClient
			.query<Pick<Query, 'categories'>>(CATEGORIES_LIST_FOR_CREATE_PRODUCT, variables)
			.toPromise();

		initialLoading = false;

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

		// delete all categories after the clicked level
		let i = clickLevel + 2;
		while (Object.prototype.hasOwnProperty.call(tempCategories, i)) {
			delete tempCategories[i];
			i++;
		}
		categories = tempCategories;
		activeCategoryIndices = [...activeCategoryIndices.slice(0, clickLevel), selectedIndex];
	};

	const toggleSelectCategory = (evt: Event, category: Category) => {
		if (evt.target) {
			const checked = (evt.target as HTMLInputElement).checked;
			onCategorySelected(checked ? category : null);
			categoryChoosen = checked ? category : null;
		}
	};

	onMount(async () => {
		await loadCategories(0);
	});
</script>

{#snippet loadingCategorySkeleton()}
	<div class="flex items-center gap-1">
		{#each [null, null] as _, idx (idx)}
			<SkeletonContainer class="w-1/3">
				<Skeleton class="w-3/4 h-2" />
			</SkeletonContainer>
		{/each}
	</div>
{/snippet}

<div class="bg-gray-50 rounded p-2">
	{#if initialLoading}
		{@render loadingCategorySkeleton()}
	{:else if !categoryChoosen}
		<ul
			class="menu menu-horizontal rounded border !flex-nowrap tablet:!flex-wrap w-full max-h-96 tablet:max-h-fit"
			transition:slide
		>
			{#each categoryLevels as level, levelIdx (levelIdx)}
				{@const children = categories[level]}
				{#if children}
					<li class="w-1/3 !flex-nowrap tablet:w-1/2 max-h-80">
						<!-- svelte-ignore a11y_missing_attribute -->
						<a class="!pointer-events-none">{categoryLevelsMap[level]}</a>
						<ul class="sitename-scrollbar overflow-y-auto overflow-x-hidden">
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
						</ul>
					</li>
				{/if}
			{/each}
		</ul>
	{/if}

	<!-- selected -->

	<div class="breadcrumbs text-sm text-blue-600">
		<ul>
			{#each activeCategoryIndices as value, idx (idx)}
				{@const cate = categories[idx]?.edges[value].node as Category}
				<li class="flex items-center">
					<span>
						{cate.name}
					</span>
					{#if idx === activeCategoryIndices.length - 1}
						<input
							type="checkbox"
							class="toggle toggle-info toggle-xs ml-2"
							title="change category"
							checked={!!categoryChoosen}
							onchange={(evt) => toggleSelectCategory(evt, cate)}
						/>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>
