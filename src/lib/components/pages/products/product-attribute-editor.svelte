<script lang="ts">
	import { graphqlClient } from '$lib/client';
	import SkeletonContainer from '$lib/components/common/skeleton-container.svelte';
	import Skeleton from '$lib/components/common/skeleton.svelte';
	import { Select } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type AttributeCountableConnection,
		type Category,
		type Query
	} from '$lib/gql/graphql';
	import {
		PRODUCT_ATTRIBUTES_QUERY,
		type AttributesVariable
	} from '$lib/stores/api/admin/attribute';
	import { defaultChannel } from '$lib/utils/consts';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		productCategory: Category;
	};

	let { productCategory }: Props = $props();
	let loading = $state(true);
	let attributesOfGivenCategory = $state.frozen<AttributeCountableConnection | null | undefined>();
	const MAX_FETCHING_BATCH = 30;

	const fetchAttributes = (categoryId: string) => {
		const variables: AttributesVariable = {
			first: MAX_FETCHING_BATCH,
			choiceFirst: MAX_FETCHING_BATCH,
			channel: defaultChannel.slug,
			where: {
				inCategory: categoryId
			}
		};
		const { unsubscribe } = graphqlClient
			.query<Pick<Query, 'attributes'>, AttributesVariable>(PRODUCT_ATTRIBUTES_QUERY, variables)
			.subscribe((attributeRes) => {
				if (preHandleGraphqlResult(attributeRes)) return;

				loading = false;
				attributesOfGivenCategory = attributeRes.data?.attributes;
				tick();
			});

		return unsubscribe;
	};

	$effect(() => {
		return fetchAttributes(productCategory.id);
	});
</script>

{#if loading}
	<div class="flex items-center flex-wrap rounded border p-1">
		{#each [null, null] as _}
			<div class="w-1/2">
				<SkeletonContainer class="w-full">
					<Skeleton class="w-3/4 h-2" />
				</SkeletonContainer>
			</div>
		{/each}
	</div>
{:else if attributesOfGivenCategory}
	<div class="flex items-center flex-wrap rounded border p-1" transition:slide>
		{#each attributesOfGivenCategory.edges as attributeEdge, idx (idx)}
			<div class="w-1/2 tablet:w-full p-1 shrink flex items-center mb-2">
				<div class="w-1/4 text-xs">
					{#if attributeEdge.node.valueRequired}
						<strong class="mr-1 text-red-500">*</strong>
					{/if}
					<span>{attributeEdge.node.name}</span>
				</div>
				<div class="w-3/4">
					{#if attributeEdge.node.inputType === AttributeInputTypeEnum.Dropdown}
						{@const optionChoices = attributeEdge.node.choices}
						<Select
							options={optionChoices
								? optionChoices.edges.map((edge) => ({
										value: edge.node.id,
										label: edge.node.name || edge.node.id
									}))
								: []}
							onSelect={console.log}
						/>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
