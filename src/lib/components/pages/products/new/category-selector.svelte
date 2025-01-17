<script lang="ts">
	import type { CategoryCountableConnection, Query } from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/stores/api/admin/product';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { operationStore } from '$lib/stores/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { MegaMenu } from '$lib/components/ui/levelSelector';
	import { categoryIdStore, convertCategoryEdgesToMenuSelect } from './utils';
	import { tClient } from '$i18n';

	const NUMBER_OF_CATEGORIES_PER_FETCH = 35;

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

<div class="mb-3">
	<span class="text-sm">{tClient('product.prdCategory')}</span>
	<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
		{#if $categoriesStore.fetching}
			{@render loadingCategorySkeleton()}
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
				onSelect={(item) => categoryIdStore.set(item.value as string)}
				onDeselect={() => categoryIdStore.set(null)}
			/>
		{/if}
	</div>
</div>
