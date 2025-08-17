<script lang="ts">
	import {
		ASSIGN_PRODUCTS_TO_COLLECTION_MUTATION,
		COLLECTION_PRODUCTS_QUERY,
		COLLECTION_REMOVE_PRODUCTS_MUTATION,
		REORDER_PRODUCTS_IN_COLLECTION_MUTATION,
	} from '$lib/api/admin/collections';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Popover, type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import type { TableColumnProps } from '$lib/components/ui/Table';
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
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import type { AnyVariables, TypedDocumentNode } from '@urql/core';
	import ProductAssignModal from './product-assign-modal.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { tranFunc } from '$i18n';

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

	let forceReExecuteGraphqlQuery = $state(collectionID ? true : false);
	let loading = $state(false);
	let shouldDisable = $derived(loading || disabled);

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = $derived([
		{
			title: $tranFunc('common.pic'),
			child: picture,
		},
		{
			title: $tranFunc('common.name'),
			child: name,
		},
		{
			title: $tranFunc('product.category'),
			child: category,
		},
		{
			title: $tranFunc('settings.availability'),
			child: availability,
		},
		{
			title: $tranFunc('settings.action'),
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
				$tranFunc('collection.successReorder'),
			)
		)
			return;

		// success, trigger refetching data
		forceReExecuteGraphqlQuery = true;
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
			successMessages.push($tranFunc('collection.successAssignedPrds'));
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
			successMessages.push($tranFunc('collection.successUnassignedPrds'));
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
		if (!hasErr) forceReExecuteGraphqlQuery = true;
	};
</script>

{#snippet action({ item }: { item: Product })}
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

{#snippet picture({ item }: { item: Product })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.name} size="sm" />
{/snippet}

{#snippet name({ item }: { item: Product })}
	<a
		href={AppRoute.PRODUCT_DETAILS(item.slug)}
		aria-label={item.name}
		data-interactive
		class="link"
	>
		{item.name}
	</a>
{/snippet}

{#snippet category({ item }: { item: Product })}
	<div>{item.category?.name || '-'}</div>
{/snippet}

{#snippet availability({ item }: { item: Product })}
	{@const channels =
		item.channelListings?.map((item) => ({
			channel: item.channel.name,
			published: item.isPublished,
		})) || []}
	{#snippet trigger({ onclick, onclose }: DropdownTriggerInterface)}
		<Badge
			text={`${channels.length} ${$tranFunc('product.channel')}`}
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
				<span class="flex-1">{$tranFunc('product.channel')}</span>
				<span class="flex-1">{$tranFunc('settings.status')}</span>
			</div>
			{#each channels as chan, idx (idx)}
				<div class="flex flex-nowrap mt-1 gap-1">
					<div class="flex-1">{chan.channel}</div>
					<div class="flex-1">
						<Badge
							text={chan.published
								? $tranFunc('product.published')
								: $tranFunc('product.unpublished')}
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
			bind:forceReExecuteGraphqlQuery
			columns={PRODUCT_COLUMNS}
			onDragEnd={handleReOrderProductsInCollection}
			dragEffectType="move-position"
			disabled={shouldDisable}
		/>
	</div>
</div>
