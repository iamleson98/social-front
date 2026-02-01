<script lang="ts">
	import { T } from '$i18n';
	import {
		ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
		COLLECTION_PRODUCTS_QUERY,
		COLLECTION_REMOVE_PRODUCTS_MUTATION,
		REORDER_PRODUCTS_IN_COLLECTION_MUTATION,
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Popover } from '$lib/components/ui/Popover';
	import type {
		GraphqlPaginableTableInterface,
		TableCellProps,
		TableColumnProps,
	} from '$lib/components/ui/Table';
	import { GraphqlPaginableTable } from '$lib/components/ui/Table';
	import type {
		Mutation,
		MutationCollectionReorderProductsArgs,
		Product,
		ProductOrderField,
		Query,
		QueryProductsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import {
		checkIfGraphqlResultHasError,
		SitenameCommonClassName,
		stringSlicer,
	} from '$lib/utils/utils';
	import ProductAssignModal from './product-assign-modal.svelte';
	import type { AnyVariables, TypedDocumentNode } from '@urql/core';

	type Props = {
		/**if not provided, meaning this is create page*/
		collectionID?: string;
		disabled?: boolean;
	};

	let { collectionID, disabled }: Props = $props();

	let filterVariables = $state<QueryProductsArgs & { id?: string }>({
		first: 10,
		id: collectionID,
	});

	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);
	let productTableRef = $state<GraphqlPaginableTableInterface>();

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: $T('common.pic'),
			child: picture,
		},
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('product.category'),
			child: category,
		},
		{
			title: $T('settings.availability'),
			child: availability,
		},
		{
			title: $T('settings.action'),
			child: action,
		},
	]);

	const handleReOrderProductsInCollection = async (
		dragIndex: number,
		dragItem: Product,
		dropIndex: number,
		_: Product,
	) => {
		if (!collectionID) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionReorderProducts'>,
			MutationCollectionReorderProductsArgs
		>(REORDER_PRODUCTS_IN_COLLECTION_MUTATION, {
			collectionId: collectionID,
			moves: [{ productId: dragItem.id, sortOrder: dropIndex - dragIndex }],
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'collectionReorderProducts',
				$T('collection.successReorder'),
			)
		)
			return;

		// success, trigger refetching data
		productTableRef?.triggerFetchData();
	};

	type TaskProps = {
		query: TypedDocumentNode<any, AnyVariables>;
		variables: Record<string, unknown>;
	};

	const handleAssignProducts = async (addProducts: Product[], removeProductIds: string[]) => {
		if (!collectionID) return;

		const tasks: TaskProps[] = [];
		const keys: (keyof Mutation)[] = [];
		const successMessages: string[] = [];

		if (addProducts.length) {
			tasks.push({
				query: ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
				variables: {
					collectionId: collectionID,
					products: addProducts.map((item) => item.id),
				},
			});
			keys.push('collectionAddProducts');
			successMessages.push($T('collection.successAssignedPrds'));
		}
		if (removeProductIds.length) {
			tasks.push({
				query: COLLECTION_REMOVE_PRODUCTS_MUTATION,
				variables: {
					collectionId: collectionID,
					products: removeProductIds,
				},
			});
			keys.push('collectionRemoveProducts');
			successMessages.push($T('collection.successUnassignedPrds'));
		}

		if (!tasks.length) return;

		loading = true;
		const promises = tasks.map(({ query, variables }) =>
			GRAPHQL_CLIENT.mutation(query, variables).toPromise(),
		);
		const results = await Promise.all(promises);

		loading = false;
		let hasErr = false;

		results.forEach(
			(res, idx) => (hasErr ||= checkIfGraphqlResultHasError(res, keys[idx], successMessages[idx])),
		);

		// success, trigger refetching data
		if (!hasErr) productTableRef?.triggerFetchData();
	};
</script>

{#snippet action({ item }: TableCellProps<Product>)}
	<div class="text-center">
		<IconButton
			icon={Trash}
			variant="light"
			size="xs"
			color="red"
			onclick={() => handleAssignProducts([], [item.id])}
			disabled={shouldDisable}
			data-interactive
		/>
	</div>
{/snippet}

{#snippet picture({ item }: TableCellProps<Product>)}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet name({ item }: TableCellProps<Product>)}
	<a
		href={AppRoute.PRODUCT_DETAILS(item.slug)}
		aria-label={item.name}
		data-interactive
		class="link"
		title={item.name}
	>
		{stringSlicer(item.name, 40)}
	</a>
{/snippet}

{#snippet category({ item }: TableCellProps<Product>)}
	<div>{item.category?.name || '-'}</div>
{/snippet}

{#snippet availability({ item }: TableCellProps<Product>)}
	{@const channels =
		item.channelListings?.map((item) => ({
			channel: item.channel.name,
			published: item.isPublished,
		})) || []}

	<Popover placement="left">
		{#snippet trigger({ onclick, onclose })}
			<Badge
				text={`${channels.length} ${$T('product.channel')}`}
				color={channels.length ? 'green' : 'orange'}
				variant={channels.length ? 'filled' : 'light'}
				onmouseenter={onclick}
				ontouchstart={onclick}
				onmouseleave={onclose}
			/>
		{/snippet}
		<div class="py-1 px-2 rounded-lg border border-gray-200 bg-white w-fit shadow-sm">
			<div class="flex flex-nowrap font-medium gap-1 text-sm">
				<span class="flex-1">{$T('product.channel')}</span>
				<span class="flex-1">{$T('settings.status')}</span>
			</div>
			{#each channels as chan, idx (idx)}
				<div class="flex flex-nowrap mt-1 gap-1">
					<div class="flex-1">{chan.channel}</div>
					<div class="flex-1">
						<Badge
							text={chan.published ? $T('product.published') : $T('product.unpublished')}
							size="xs"
							color={chan.published ? 'green' : 'red'}
						/>
					</div>
				</div>
			{/each}
		</div>
	</Popover>
{/snippet}

<div class={SitenameCommonClassName}>
	<ProductAssignModal onApply={handleAssignProducts} {collectionID} disabled={shouldDisable} />
	<div class="overflow-x-auto">
		<GraphqlPaginableTable
			query={COLLECTION_PRODUCTS_QUERY}
			resultKey={'collection.products' as keyof Query}
			bind:variables={filterVariables}
			columns={PRODUCT_COLUMNS}
			bind:this={productTableRef}
			onDragEnd={handleReOrderProductsInCollection}
			dragEffectType="move-position"
			disabled={shouldDisable}
			autoRefetchOnPaginationParamsChange
			autoFetchDataOnMount
		/>
	</div>
</div>
