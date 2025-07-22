<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_DELETE_MUTATION, COLLECTIONS_QUERY } from '$lib/api/collections';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/collections/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		type Collection,
		CollectionSortField,
		type Mutation,
		type MutationCollectionDeleteArgs,
		type QueryCollectionsArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let filterVariables = $state<QueryCollectionsArgs>({
		first: 10,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const COLLECTION_COLUMNS: TableColumnProps<Collection, CollectionSortField>[] = $derived([
		{
			title: $tranFunc('common.pic'),
			child: image,
		},
		{
			title: $tranFunc('common.name'),
			key: CollectionSortField.Name,
			child: collectionName,
		},
		{
			title: $tranFunc('settings.availability'),
			child: availability,
		},
		{
			title: $tranFunc('collection.noOfPrds'),
			child: noOfProducts,
			key: CollectionSortField.ProductCount,
		},
		{
			title: $tranFunc('common.action'),
			child: action,
		},
	]);

	const handleDeleteCollection = async (id: string) => {
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionDelete'>,
			MutationCollectionDeleteArgs
		>(COLLECTION_DELETE_MUTATION, {
			id: id,
		});

		if (checkIfGraphqlResultHasError(result, 'collectionDelete', $tranFunc('common.delSuccess')))
			return;

		forceReExecuteGraphqlQuery = true;
	};
</script>

{#snippet availability({ item }: { item: Collection })}
	<Badge
		text="{item.channelListings?.length ?? 0} {$tranFunc('product.channel')}"
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
			children: $tranFunc('btn.update'),
			startIcon: Edit,
			href: AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)
		},
		{
			children: $tranFunc('btn.delete'),
			startIcon: Trash,
			onclick: () => {
				ALERT_MODAL_STORE.openAlertModal({
				content: $tranFunc('common.confirmDel'),
				onOk: () => handleDeleteCollection(item.id)
			});
			},
			class: 'text-red-600',
		}
	]}
	<div class="pl-2">
		{#snippet trigger(opts: DropdownTriggerInterface)}
			<IconButton icon={Dots} {...opts} size="xs" variant="light" color="gray" />
		{/snippet}
		<DropDown {trigger} options={MENU_OPTIONS} />
	</div>
{/snippet}

<Filter bind:variables={filterVariables} bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={COLLECTIONS_QUERY}
	class="bg-white rounded-lg p-3 border border-gray-200"
	bind:variables={filterVariables}
	resultKey="collections"
	columns={COLLECTION_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
