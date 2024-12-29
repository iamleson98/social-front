<script lang="ts">
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum, type Category, type Query } from '$lib/gql/graphql';
	import {
		PRODUCT_ATTRIBUTES_QUERY,
		type AttributesVariable
	} from '$lib/stores/api/admin/attribute';
	import { operationStore } from '$lib/stores/api/operation';
	import { defaultChannel } from '$lib/utils/consts';
	import { slide } from 'svelte/transition';

	type Props = {
		productCategory: Category;
	};

	let { productCategory }: Props = $props();
	const MAX_FETCHING_BATCH = 50;

	const attributeQueryStore = operationStore<Pick<Query, 'attributes'>, AttributesVariable>({
		kind: 'mutation',
		query: PRODUCT_ATTRIBUTES_QUERY,
		context: {
			requestPolicy: 'network-only'
		},
		variables: {
			first: MAX_FETCHING_BATCH,
			choiceFirst: MAX_FETCHING_BATCH,
			channel: defaultChannel.slug,
			where: {
				inCategory: productCategory.id
			}
		}
	});
</script>

<div class="bg-gray-50 rounded-lg border border-gray-200 p-2">
	{#if $attributeQueryStore.fetching}
		<div class="flex items-center flex-wrap rounded border p-1">
			{#each [null, null] as _}
				<div class="w-1/2">
					<SkeletonContainer class="w-full">
						<Skeleton class="w-3/4 h-2" />
					</SkeletonContainer>
				</div>
			{/each}
		</div>
	{:else if $attributeQueryStore.error}
		<Alert variant="error" size="md" bordered>
			{$attributeQueryStore.error.message}
		</Alert>
	{:else if $attributeQueryStore.data?.attributes?.edges}
		<div class="flex items-center flex-wrap rounded border p-1" transition:slide>
			{#each $attributeQueryStore.data?.attributes?.edges as attributeEdge, idx (idx)}
				<div class="w-1/2 tablet:w-full p-1 shrink flex items-center mb-2">
					<div class="w-1/4 text-xs">
						{#if attributeEdge.node.valueRequired}
							<strong class="mr-1 text-red-500">*</strong>
						{/if}
						<span>{attributeEdge.node.name}</span>
					</div>
					<div class="w-3/4">
						{#if attributeEdge.node.inputType === AttributeInputTypeEnum.Dropdown && attributeEdge.node.choices}
							{@const { edges } = attributeEdge.node.choices}
							<Select
								options={edges.map((edge) => ({
									value: edge.node.id,
									label: edge.node.name || edge.node.id
								}))}
								value={undefined}
							/>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
