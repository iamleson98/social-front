<script lang="ts">
	import {
		ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
		COLLECTION_PRODUCTS_QUERY
	} from '$lib/api/admin/collections';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
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

	type Props = {
		/**if not provided, meaning this is create page*/
		collectionID?: string;
	};

	let { collectionID }: Props = $props();

	let filterVariables = $state<QueryProductsArgs & { id?: string }>({
		first: 10,
		id: collectionID
	});
	let filterAllProductsVariables = $state<QueryProductsArgs>({
		first: 10,
		filter: {
			search: ''
		}
	});
	let forceReExecuteGraphqlQuery = $state(collectionID ? true : false);
	let openAssignProductModal = $state(false);
	let performSearch = $state(true);

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

	const PRODUCT_MODAL_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: '',
			child: checkbox
		},
		{
			title: '',
			child: picture
		},
		{
			title: '',
			child: title
		}
	];

	let selectedProductIDs = $state<Record<string, boolean>>({});

	const handleDetachProductFromCollection = (productId: string) => {};

	const handleClickOpenProductListModal = () => {
		openAssignProductModal = true;
		performSearch = true;
		selectedProductIDs = {};
	};

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

{#snippet checkbox({ item }: { item: Product })}
	<Checkbox bind:checked={selectedProductIDs[item.id]} />
{/snippet}

{#snippet picture({ item }: { item: Product })}
	<div class="rounded-full border border-gray-200 w-8 h-8 overflow-hidden">
		<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} class="w-full h-full" />
	</div>
{/snippet}

{#snippet title({ item }: { item: Product })}
	<div>{item.name}</div>
{/snippet}

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
	<div class="mb-4 flex items-center justify-between">
		<div class="text-gray-700 font-semibold">Products in collection</div>
		<Button size="sm" onclick={handleClickOpenProductListModal}>Assign Product</Button>
	</div>
	<GraphqlPaginableTable
		query={COLLECTION_PRODUCTS_QUERY}
		resultKey={'collection.products' as keyof Query}
		bind:variables={filterVariables}
		bind:forceReExecuteGraphqlQuery
		supportDragDrop
		columns={PRODUCT_COLUMNS}
	/>
</div>

<Modal
	header="Assign products to collection"
	open={openAssignProductModal}
	okText="Assign"
	cancelText="Cancel"
	onOk={handleAssignproducts}
	onCancel={() => (openAssignProductModal = false)}
	onClose={() => (openAssignProductModal = false)}
	closeOnOutsideClick
>
	<div class="mb-4">
		<Input
			placeholder="Search product"
			class="w-full"
			bind:value={filterAllProductsVariables.filter!.search}
			inputDebounceOption={{ onInput: () => (performSearch = true), debounceTime: 800 }}
		/>
	</div>

	{#if openAssignProductModal}
		<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_ADMIN}
			resultKey={'products'}
			bind:variables={filterAllProductsVariables}
			bind:forceReExecuteGraphqlQuery={performSearch}
			columns={PRODUCT_MODAL_COLUMNS}
		/>
	{/if}
</Modal>
