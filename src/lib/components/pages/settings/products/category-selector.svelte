<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		CATEGORY_WITH_PARENTS_QUERY,
		type CategoryListForCreateProductInput,
	} from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { PencilMinus } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { BreadCrumb } from '$lib/components/ui/Breadcrumb';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Label } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import type { CategoryCountableConnection, Query, QueryCategoryArgs } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import CategoryMenu from './category-menu.svelte';
	import ErrorMsg from './error-msg.svelte';
	import { type CategorySelectItemProps } from './utils';
	import { onMount, tick } from 'svelte';

	type Props = {
		categoryID?: string;
		formOk: boolean;
		loading: boolean;
		/** indicates if this is product creation page */
		isCreatePage?: boolean;
	};

	const NUMBER_OF_CATEGORIES_PER_FETCH = 35;

	let { categoryID = $bindable(), formOk = $bindable(), loading, isCreatePage }: Props = $props();
	let categoryError = $state<string>();
	let initialSelectedItems = $state<CategorySelectItemProps[]>([]);
	let selectedItems = $state<CategorySelectItemProps[]>([]);
	let showEditCategory = $state(false);
	let checked = $state<boolean>();

	/** in product edit screen, this store should run immediately */
	const CategoryWithAncestorsStore = operationStore<Pick<Query, 'category'>, QueryCategoryArgs>({
		query: CATEGORY_WITH_PARENTS_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: categoryID,
		},
		pause: !categoryID,
	});

	/** in product creation screen, this store whould run immediately */
	const CategoriesStore = operationStore<
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

	onMount(() => {
		if (categoryID) {
			return CategoryWithAncestorsStore.subscribe((result) => {
				if (result.data?.category) {
					const items: CategorySelectItemProps[] = [
						{
							value: result.data.category.id,
							title: result.data.category.name,
							level: result.data.category.level,
						},
					];

					result.data.category.ancestors?.edges.forEach(({ node }) => {
						items.push({
							title: node.name,
							value: node.id,
							level: node.level,
						});
					});

					selectedItems = items.sort((a, b) => a.level - b.level);
					initialSelectedItems = [...selectedItems];
				}
			});
		}
	});

	$effect(() => {
		if (
			selectedItems.length &&
			(selectedItems[selectedItems.length - 1].children ||
				(!selectedItems[selectedItems.length - 1].children && !categoryID))
		) {
			categoryError = $CommonState.FieldRequiredError;
		} else {
			categoryError = '';
		}
		formOk = !categoryError;
	});

	const handleCheckChange = (checked: boolean) => {
		if (checked) {
			categoryID = selectedItems[selectedItems.length - 1].value as string;
		} else {
			categoryID = undefined;
		}
	};
</script>

{#snippet CategorySelector(connection: CategoryCountableConnection)}
	<div class="grid grid-cols-4 gap-1.5 w-full mb-2">
		<CategoryMenu {connection} bind:selectedItems disabled={loading} />
	</div>
	<div class="flex items-center gap-2">
		<BreadCrumb
			class="text-blue-600 text-sm"
			items={selectedItems.map((item) => ({ value: item.title }))}
		/>
		{#if selectedItems.length && !selectedItems[selectedItems.length - 1].children}
			<Checkbox
				bind:checked
				title="Select this item"
				size="sm"
				disabled={loading}
				onCheckChange={handleCheckChange}
			/>
		{/if}
	</div>
{/snippet}

<div class={SitenameCommonClassName}>
	<Label required requiredAtPos="end" label={$tranFunc('product.prdCategory')} />
	{#if $CategoryWithAncestorsStore.fetching || $CategoriesStore.fetching}
		<SelectSkeleton label />
	{:else if $CategoriesStore.error || $CategoryWithAncestorsStore.error}
		<Alert size="sm" variant="error">
			{$CategoriesStore.error?.message || $CategoryWithAncestorsStore.error?.message}
		</Alert>
	{:else if isCreatePage && $CategoriesStore.data?.categories}
		{@render CategorySelector($CategoriesStore.data.categories)}
	{:else if $CategoryWithAncestorsStore.data?.category}
		{#if !showEditCategory}
			<div class="flex items-center gap-2">
				<BreadCrumb
					class="text-blue-600 text-sm"
					items={selectedItems.map((item) => ({ value: item.title }))}
				/>
				<IconButton
					icon={PencilMinus}
					size="xs"
					color="gray"
					variant="light"
					disabled={loading}
					class="tooltip tooltip-top"
					data-tip={$tranFunc('btn.update')}
					onclick={async () => {
						CategoriesStore.resume();
						await tick();
						showEditCategory = true;
					}}
				/>
			</div>
		{:else if showEditCategory}
			{@render CategorySelector($CategoriesStore.data?.categories!)}
			<Button
				size="xs"
				variant="light"
				color="red"
				disabled={loading}
				onclick={() => {
					showEditCategory = false;
					selectedItems = initialSelectedItems;
				}}
			>
				{$tranFunc('common.cancel')}
			</Button>
		{/if}
	{/if}

	<ErrorMsg error={categoryError} />
</div>
