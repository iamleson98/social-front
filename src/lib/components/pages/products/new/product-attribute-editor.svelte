<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum, type Query } from '$lib/gql/graphql';
	import {
		PRODUCT_ATTRIBUTES_QUERY,
		type AttributesVariable
	} from '$lib/stores/api/admin/attribute';
	import { operationStore } from '$lib/stores/api/operation';
	import { defaultChannel } from '$lib/utils/consts';
	import { slide } from 'svelte/transition';
	import { categoryIdStore } from './utils';
	import { onMount } from 'svelte';
	import { tClient } from '$i18n';

	const MAX_FETCHING_BATCH = 50;

	const attributeQueryStore = operationStore<Pick<Query, 'attributes'>, AttributesVariable>({
		kind: 'query',
		query: PRODUCT_ATTRIBUTES_QUERY,
		context: {
			requestPolicy: 'network-only'
		},
		variables: {
			first: MAX_FETCHING_BATCH,
			choiceFirst: MAX_FETCHING_BATCH,
			channel: defaultChannel.slug,
			where: {
				inCategory: $categoryIdStore
			}
		},
		pause: !$categoryIdStore
	});

	onMount(() => {
		return categoryIdStore.subscribe((id) => {
			if (!id) return;

			attributeQueryStore.reexecute({
				variables: {
					...$attributeQueryStore.operation.variables,
					where: {
						inCategory: id
					}
				}
			});
		});
	});
</script>

{#if $categoryIdStore}
	<div class="mb-3">
		<span class="text-sm">{tClient('product.tabAttributes')}</span>
		<div class="bg-gray-50 rounded-lg border border-gray-200 p-3" transition:slide>
			{#if $attributeQueryStore.fetching}
				<div class="flex items-center flex-wrap">
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
			{:else if !$attributeQueryStore.data?.attributes?.edges.length}
				<Alert variant="info" size="sm" bordered>This category has no attributes</Alert>
			{:else if $attributeQueryStore.data?.attributes?.edges}
				<div class="flex items-center flex-wrap">
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
	</div>
{/if}
