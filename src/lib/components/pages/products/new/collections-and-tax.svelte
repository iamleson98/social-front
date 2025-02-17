<script lang="ts">
	import { tranFunc } from '$i18n';
	import { COLLECTIONS_QUERY } from '$lib/api/collections';
	import { operationStore } from '$lib/api/operation';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import { Alert } from '$lib/components/ui/Alert';
	import { MultiSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type {
		ProductInput,
		Query,
		QueryCollectionsArgs,
		QueryTaxClassesArgs
	} from '$lib/gql/graphql';

	type Props = {
		collections: ProductInput['collections'];
		taxClassID: ProductInput['taxClass'];
		loading: boolean;
	};

	let { collections = $bindable(), taxClassID = $bindable(), loading }: Props = $props();

	let innerCollections = $state<SelectOption[]>([]);

	$effect(() => {
		if (innerCollections.length) collections = innerCollections.map((item) => item.value as string);
	});

	const collectionsStore = operationStore<Pick<Query, 'collections'>, QueryCollectionsArgs>({
		kind: 'query',
		query: COLLECTIONS_QUERY,
		context: {
			requestPolicy: 'cache-and-network'
		},
		variables: {
			first: 20
		}
	});

	const taxClassesStore = operationStore<Pick<Query, 'taxClasses'>, QueryTaxClassesArgs>({
		kind: 'query',
		query: TAX_CLASSES_QUERY,
		context: {
			requestPolicy: 'cache-and-network'
		},
		variables: {
			first: 20
		}
	});
</script>

<div class="mb-3 flex items-center gap-2">
	<!-- MARK: Collections -->
	<div class="w-1/2 mobile-l:w-full">

		{#if $collectionsStore.fetching}
			<SkeletonContainer class="w-full">
				<Skeleton class="w-full h-4" />
			</SkeletonContainer>
		{:else if $collectionsStore.error}
			<Alert variant="error" size="sm" bordered>{$collectionsStore.error.message}</Alert>
		{:else if $collectionsStore.data?.collections}
			{@const selectOptions = $collectionsStore.data?.collections?.edges.map<SelectOption>(
				({ node }) => ({ value: node.id, label: node.name })
			)}
			<MultiSelect
				options={selectOptions}
				class="w-full"
				bind:value={innerCollections}
				label={$tranFunc('product.collection')}
				size="sm"
				disabled={loading}
			/>
		{/if}
	</div>

	<!-- MARK: Tax classes -->
	<div class="w-1/2 mobile-l:w-full">

		{#if $taxClassesStore.fetching}
			<SkeletonContainer class="w-full">
				<Skeleton class="w-full h-4" />
			</SkeletonContainer>
		{:else if $taxClassesStore.error}
			<Alert variant="error" size="sm" bordered>{$taxClassesStore.error.message}</Alert>
		{:else if $taxClassesStore.data?.taxClasses}
			{@const selectOptions = $taxClassesStore.data?.taxClasses?.edges.map<SelectOption>(
				({ node }) => ({ value: node.id, label: node.name })
			)}
			<Select
				options={selectOptions}
				class="w-full"
				bind:value={taxClassID as string}
				label={$tranFunc('product.taxCls')}
				size="sm"
				disabled={loading}
			/>
		{/if}
	</div>
</div>
