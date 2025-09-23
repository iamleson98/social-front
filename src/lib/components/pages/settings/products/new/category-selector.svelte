<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput,
	} from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Label } from '$lib/components/ui/Input';
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import type { SelectItemProps } from '$lib/components/ui/MegaMenu/types';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type { Query } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import ErrorMsg from './error-msg.svelte';
	import { convertCategoryEdgesToMenuSelect } from './utils';
	import { onMount } from 'svelte';

	type Props = {
		categoryID?: string | null;
		formOk: boolean;
		loading: boolean;
	};

	const NUMBER_OF_CATEGORIES_PER_FETCH = 35;

	let {
		categoryID = $bindable<string | null | undefined>(),
		formOk = $bindable(),
		loading,
	}: Props = $props();
	let categoryError = $state<string>();
	let menuItems = $state<SelectItemProps[]>([]);

	const categoriesStore = operationStore<
		Pick<Query, 'categories'>,
		CategoryListForCreateProductInput
	>({
		query: CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		requestPolicy: 'cache-and-network',
		variables: {
			level: 0,
			first: NUMBER_OF_CATEGORIES_PER_FETCH,
		},
		pause: !!categoryID,
	});

	// const CategoryWithParentsQuery = operationStore<Pick<Query, 'category'>, QueryCategoryArgs>({
	// 	query: CATEGORY_WITH_PARENTS_QUERY,
	// 	variables: {
	// 		id: categoryID,
	// 	},
	// 	pause: !categoryID,
	// });

	// onMount(() => categoriesStore.subscribe(result => {
	// 	if (result.data?.categories)
	// }))

	const handleCategorySelection = (newCateId: string | null) => {
		categoryError = newCateId ? undefined : $CommonState.FieldRequiredError;
		categoryID = newCateId;
	};

	onMount(() => {
		if (categoryID) {
			// meaning it is edit page
			// return CategoryWithParentsQuery.subscribe((result) => {
			// 	if (result.data?.category) {
			// 		if (result.data.category.ancestors?.edges.length) {
			// 			const connection = result.data.category.ancestors.ed
			// 		}
			// 		menuItems = convertCategoryEdgesToMenuSelect(result.data.categories);
			// 	}
			// });
		} else
			return categoriesStore.subscribe((result) => {
				if (result.data?.categories) {
					menuItems = convertCategoryEdgesToMenuSelect(result.data.categories);
				}
			});
	});

	$effect(() => {
		formOk = !categoryError;
	});
</script>

<div class={SitenameCommonClassName}>
	<Label required requiredAtPos="end" label={$tranFunc('product.prdCategory')} />
	<div class={['border rounded-lg p-2', categoryError && 'border-red-200 bg-red-50']}>
		{#if $categoriesStore.fetching}
			<TableSkeleton numOfRows={4} numColumns={3} />
		{:else if $categoriesStore.error}
			<Alert variant="error" bordered size="sm">
				{$categoriesStore.error.message}
			</Alert>
		{:else if menuItems}
			<MegaMenu
				items={menuItems}
				onSelect={(item) => handleCategorySelection(item.value as string)}
				onDeselect={() => handleCategorySelection(null)}
				disabled={loading}
			/>
		{/if}
	</div>

	<ErrorMsg error={categoryError} />
</div>
