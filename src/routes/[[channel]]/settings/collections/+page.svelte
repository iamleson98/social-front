<script lang="ts">
	import { T } from '$i18n';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_DELETE_MUTATION, COLLECTIONS_QUERY } from '$lib/api/collections';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/collections/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		type Collection,
		CollectionSortField,
		type Mutation,
		type MutationCollectionDeleteArgs,
		type QueryCollectionsArgs,
	} from '$lib/gql/graphql';
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let filterVariables = $state<QueryCollectionsArgs>({
		first: 10,
		filter: { search: '' },
	});

	const COLLECTION_COLUMNS: TableColumnProps<Collection, CollectionSortField>[] = $derived([
		{
			title: $T('common.pic'),
			child: image,
		},
		{
			title: $T('common.name'),
			key: CollectionSortField.Name,
			child: collectionName,
		},
		{
			title: $T('settings.availability'),
			child: availability,
		},
		{
			title: $T('collection.noOfPrds'),
			child: noOfProducts,
			key: CollectionSortField.ProductCount,
		},
		{
			title: $T('common.action'),
			child: action,
		},
	]);
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const handleDeleteCollection = async (id: string) => {
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionDelete'>,
			MutationCollectionDeleteArgs
		>(COLLECTION_DELETE_MUTATION, {
			id: id,
		});

		if (checkIfGraphqlResultHasError(result, 'collectionDelete', $CommonState.DeleteSuccess))
			return;

		tableRef?.triggerFetchData();
	};
</script>

{#snippet availability({ item }: { item: Collection })}
	<Badge
		text="{item.channelListings?.length ?? 0} {$T('product.channel')}"
		color="green"
		class="tooltip-top tooltip"
		data-tip={item.channelListings?.map((list) => list.channel.name).join(', ')}
	/>
{/snippet}

{#snippet collectionName({ item }: { item: Collection })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)}>
		{item.name}
	</a>
{/snippet}

{#snippet image({ item }: { item: Collection })}
	<Thumbnail
		src={item.backgroundImage?.url}
		alt={item.backgroundImage?.alt || item.name}
		size="sm"
	/>
{/snippet}

{#snippet noOfProducts({ item }: { item: Collection })}
	<span>{item.products?.totalCount}</span>
{/snippet}

{#snippet action({ item }: { item: Collection })}
	{@const MENU_OPTIONS: MenuItemProps[] = [
		{
			children: $T('btn.update'),
			startIcon: Edit,
			href: AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)
		},
		{
			children: $T('btn.delete'),
			startIcon: Trash,
			onclick: () => {
				AlertModalStore.openAlertModal({
				content: $T('common.confirmDel'),
				onOk: () => handleDeleteCollection(item.id)
			});
			},
			class: 'text-red-600',
		}
	]}
	<div class="pl-2">
		<DropDown options={MENU_OPTIONS}>
			{#snippet trigger(opts)}
				<IconButton icon={Dots} {...opts} size="xs" variant="light" color="gray" />
			{/snippet}
		</DropDown>
	</div>
{/snippet}

<div class="mb-2">
	<Filter bind:variables={filterVariables} {tableRef} />
</div>

<GraphqlPaginableTable
	query={COLLECTIONS_QUERY}
	bind:variables={filterVariables}
	resultKey="collections"
	columns={COLLECTION_COLUMNS}
	bind:this={tableRef}
/>
