<script lang="ts">
	import type { CategoryCountableConnection, Query } from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/api/admin/product';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import { convertCategoryEdgesToMenuSelect } from './utils';
	import { tranFunc } from '$i18n';
	import ErrorMsg from './error-msg.svelte';
	import { Label } from '$lib/components/ui/Input';

	type Props = {
		categoryID?: string | null;
		ok: boolean;
	};

	const NUMBER_OF_CATEGORIES_PER_FETCH = 35;

	let { categoryID = $bindable<string | null | undefined>(), ok = $bindable() }: Props = $props();
	let categoryError = $state<string>();

	const categoriesStore = operationStore<
		Pick<Query, 'categories'>,
		CategoryListForCreateProductInput
	>({
		kind: 'query',
		query: CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		context: {
			requestPolicy: 'network-only'
		},
		variables: {
			level: 0,
			first: NUMBER_OF_CATEGORIES_PER_FETCH
		}
	});

	const handleCategorySelection = (newCateId: string | null) => {
		categoryError = newCateId ? undefined : $tranFunc('helpText.fieldRequired');
		categoryID = newCateId;
	};

	$effect(() => {
		ok = !categoryError;
	});
</script>

<div class="mb-3">
	<Label required requiredAtPos="end" label={$tranFunc('product.prdCategory')} />
	<div
		class="border rounded-lg p-3 {categoryError
			? 'border-red-200 bg-red-50'
			: 'border-gray-200 bg-gray-50'}"
	>
		{#if $categoriesStore.fetching}
			<div class="flex items-center gap-1">
				{#each [null, null] as _, idx (idx)}
					<SkeletonContainer class="w-1/3">
						<Skeleton class="w-3/4 h-2" />
					</SkeletonContainer>
				{/each}
			</div>
		{:else if $categoriesStore.error}
			<Alert variant="error" bordered size="sm">
				{$categoriesStore.error.message}
			</Alert>
		{:else}
			{@const items = convertCategoryEdgesToMenuSelect(
				$categoriesStore.data?.categories || ({} as CategoryCountableConnection)
			)}
			<MegaMenu
				{items}
				onSelect={(item) => handleCategorySelection(item.value as string)}
				onDeselect={() => handleCategorySelection(null)}
			/>
		{/if}
	</div>

	<ErrorMsg error={categoryError} />
</div>
