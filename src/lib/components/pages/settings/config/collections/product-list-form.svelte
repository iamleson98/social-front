<script lang="ts">
	import {
		ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
		COLLECTION_PRODUCTS_QUERY
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import type { TableColumnProps } from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import type {
		Mutation,
		MutationCollectionAddProductsArgs,
		Product,
		ProductOrderField,
		Query,
		QueryProductsArgs
	} from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import ProductAssignModal from './product-assign-modal.svelte';

	type Props = {
		/**if not provided, meaning this is create page*/
		collectionID?: string;
	};

	let { collectionID }: Props = $props();

	let filterVariables = $state<QueryProductsArgs & { id?: string }>({
		first: 10,
		id: collectionID
	});

	let forceReExecuteGraphqlQuery = $state(collectionID ? true : false);
	let openAssignProductModal = $state(false);

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
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

	let selectedProductIDs = $state<Record<string, boolean>>({});

	const handleDetachProductFromCollection = (productId: string) => {};

	const handleAssignproducts = async () => {
		if (!collectionID) return;

		const productIds = Object.keys(selectedProductIDs).filter((key) => selectedProductIDs[key]);

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionAddProducts'>,
			MutationCollectionAddProductsArgs
		>(ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION, {
			collectionId: collectionID,
			products: productIds
		});

		if (preHandleErrorOnGraphqlResult(result, 'collectionAddProducts')) return;

		toastStore.send({
			variant: 'success',
			message: 'Products assigned successfully'
		});

		openAssignProductModal = false;
	};
</script>

{#snippet action({ item }: { item: Product })}
	<IconButton
		icon={Trash}
		variant="light"
		size="xs"
		color="red"
		onclick={() => handleDetachProductFromCollection(item.id)}
	/>
{/snippet}

{#snippet name({ item }: { item: Product })}
	<div class="flex items-center gap-2">
		<div class="rounded-full border border-gray-200 w-8 h-8 overflow-hidden">
			<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} class="w-full h-full" />
		</div>
		<div>{item.name}</div>
	</div>
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
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<Badge text={`${channels.length} channels`} onmouseenter={onclick} ontouchstart={onclick} />
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
	<ProductAssignModal onApply={console.log} />
	<GraphqlPaginableTable
		query={COLLECTION_PRODUCTS_QUERY}
		resultKey={'collection.products' as keyof Query}
		bind:variables={filterVariables}
		bind:forceReExecuteGraphqlQuery
		columns={PRODUCT_COLUMNS}
	/>
</div>
