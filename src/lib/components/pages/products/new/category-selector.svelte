<script lang="ts">
	import type { CategoryCountableConnection, Query } from '$lib/gql/graphql';
	import {
		CATEGORIES_LIST_FOR_CREATE_PRODUCT,
		type CategoryListForCreateProductInput
	} from '$lib/stores/api/admin/product';
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { operationStore } from '$lib/stores/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { MegaMenu } from '$lib/components/ui/MegaMenu';
	import { convertCategoryEdgesToMenuSelect } from './utils';
	import { tranFunc } from '$i18n';

	type Props = {
		categoryID?: string | null;
	};

	let { categoryID = $bindable<string | null | undefined>() }: Props = $props();

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

<div class="mb-3">
	<span class="text-sm">{$tranFunc('product.prdCategory')}</span>
	<div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
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
				onSelect={(item) => (categoryID = item.value as string)}
				onDeselect={() => (categoryID = null)}
			/>
		{/if}
	</div>
</div>
