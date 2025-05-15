<script lang="ts">
	import {
		ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
		COLLECTION_PRODUCTS_QUERY,
		COLLECTION_REMOVE_PRODUCTS_MUTATION,
		REORDER_PRODUCTS_IN_COLLECTION_MUTATION
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import type {
		Mutation,
		MutationCollectionAddProductsArgs,
		MutationCollectionRemoveProductsArgs,
		MutationCollectionReorderProductsArgs,
		Product,
		ProductOrderField,
		Query,
		QueryProductsArgs
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import ProductAssignModal from './product-assign-modal.svelte';

	type Props = {
		/**if not provided, meaning this is create page*/
		collectionID?: string;
		disabled?: boolean;
	};

	let { collectionID, disabled }: Props = $props();

	let filterVariables = $state<QueryProductsArgs & { id?: string }>({
		first: 10,
		id: collectionID
	});

	let forceReExecuteGraphqlQuery = $state(collectionID ? true : false);
	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'Pic',
			child: picture
		},
		{
			title: 'Name',
			child: name
		},
		{
			title: 'Category',
			child: category
		},
		{
			title: 'Availability',
			child: availability
		},
		{
			title: 'Action',
			child: action
		}
	];

	const handleReOrderProductsInCollection = async (
		dragIndex: number,
		dragItem: Product,
		dropIndex: number,
		_: Product
	) => {
		if (!collectionID) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionReorderProducts'>,
			MutationCollectionReorderProductsArgs
		>(REORDER_PRODUCTS_IN_COLLECTION_MUTATION, {
			collectionId: collectionID,
			moves: [{ productId: dragItem.id, sortOrder: dropIndex - dragIndex }]
		});

		loading = false;

		if (
			preHandleErrorOnGraphqlResult(
				result,
				'collectionReorderProducts',
				'Successfully reorderd products of collection'
			)
		)
			return;

		// success, trigger refetching data
		forceReExecuteGraphqlQuery = true;
	};

	const handleAssignProducts = async (addProductIds: string[], removeProductIds: string[]) => {
		if (!collectionID) return;

		loading = true;

		if (addProductIds.length) {
			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'collectionAddProducts'>,
				MutationCollectionAddProductsArgs
			>(ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION, {
				collectionId: collectionID,
				products: addProductIds
			});
			preHandleErrorOnGraphqlResult(
				result,
				'collectionAddProducts',
				'Successfully assigned products to collection'
			);
		}
		if (removeProductIds.length) {
			const result = await GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'collectionRemoveProducts'>,
				MutationCollectionRemoveProductsArgs
			>(COLLECTION_REMOVE_PRODUCTS_MUTATION, {
				collectionId: collectionID,
				products: removeProductIds
			});
			preHandleErrorOnGraphqlResult(
				result,
				'collectionRemoveProducts',
				'Successfully unassigned products from collection'
			);
		}

		loading = false;
		// success, trigger refetching data
		forceReExecuteGraphqlQuery = true;
	};
</script>

{#snippet action({ item }: { item: Product })}
	<IconButton
		icon={Trash}
		variant="light"
		size="xs"
		color="red"
		onclick={() => handleAssignProducts([], [item.id])}
		disabled={shouldDisable}
		data-interactive
	/>
{/snippet}

{#snippet picture({ item }: { item: Product })}
	<div class="rounded-lg border border-gray-200 w-9 h-9 overflow-hidden">
		<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} class="w-full h-full" />
	</div>
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a href={AppRoute.PRODUCT_DETAILS(item.slug)} aria-label={item.name} data-interactive
		>{item.name}</a
	>
{/snippet}

{#snippet category({ item }: { item: Product })}
	<div>{item.category?.name || '-'}</div>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	{@const channels =
		item.channelListings?.map((item) => ({
			channel: item.channel.name,
			published: item.isPublished
		})) || []}
	{#snippet trigger({ onclick, onclose }: DropdownTriggerInterface)}
		<Badge
			text={`${channels.length} channels`}
			color={channels.length ? 'green' : 'orange'}
			variant={channels.length ? 'filled' : 'light'}
			onmouseenter={onclick}
			ontouchstart={onclick}
			onmouseleave={onclose}
		/>
	{/snippet}
	<Popover {trigger} placement="left" noReCalculateOnWindowResize>
		<div class="py-1 px-2 rounded-lg border border-gray-200 bg-white w-fit shadow-sm">
			<div class="flex flex-nowrap font-medium gap-1 text-sm">
				<span class="flex-1">channel</span>
				<span class="flex-1">status</span>
			</div>
			{#each channels as chan, idx (idx)}
				<div class="flex flex-nowrap mt-1 gap-1">
					<div class="flex-1">{chan.channel}</div>
					<div class="flex-1">
						<Badge
							text={chan.published ? 'Published' : 'Unpublished'}
							size="xs"
							color={chan.published ? 'green' : 'red'}
						/>
					</div>
				</div>
			{/each}
		</div>
	</Popover>
{/snippet}

<div class="bg-white rounded-lg border w-full border-gray-200 p-3">
	<ProductAssignModal onApply={handleAssignProducts} {collectionID} disabled={shouldDisable} />
	<GraphqlPaginableTable
		query={COLLECTION_PRODUCTS_QUERY}
		resultKey={'collection.products' as keyof Query}
		bind:variables={filterVariables}
		bind:forceReExecuteGraphqlQuery
		columns={PRODUCT_COLUMNS}
		onDragEnd={handleReOrderProductsInCollection}
		dragEffectType="move-position"
		disabled={shouldDisable}
	/>
</div>
