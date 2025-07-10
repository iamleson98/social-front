<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { COLLECTION_DELETE_MUTATION, COLLECTIONS_QUERY } from '$lib/api/collections';
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

	const COLLECTION_COLUMNS: TableColumnProps<Collection, CollectionSortField>[] = [
		{
			title: 'Collection Name',
			key: CollectionSortField.Name,
			child: collectionName,
			sortable: true,
		},
		{
			title: 'Availability',
			child: availability,
		},
		{
			title: 'No. of Products',
			child: noOfProducts,
			sortable: true,
			key: CollectionSortField.ProductCount,
		},
		{
			title: 'Action',
			child: action,
		},
	];

	const handleDeleteCollection = async (id: string) => {
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'collectionDelete'>,
			MutationCollectionDeleteArgs
		>(COLLECTION_DELETE_MUTATION, {
			id: id,
		});

		if (checkIfGraphqlResultHasError(result, 'collectionDelete', 'Collection deleted successfully'))
			return;

		forceReExecuteGraphqlQuery = true;
	};
</script>

{#snippet availability({ item }: { item: Collection })}
	<Badge
		text="{item.channelListings?.length as number} channels"
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

{#snippet noOfProducts({ item }: { item: Collection })}
	{item.products?.totalCount}
{/snippet}

{#snippet action({ item }: { item: Collection })}
	{@const MENU_OPTIONS: MenuItemProps[] = [
		{
			children: 'Edit collection',
			startIcon: Edit,
			href: AppRoute.SETTINGS_CONFIGS_COLLECTION_DETAILS(item.id)
		},
		{
			children: 'Delete collection',
			startIcon: Trash,
			onclick: () => {
				ALERT_MODAL_STORE.openAlertModal({
				content: 'Are you sure you want to delete this collection?',
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
	bind:variables={filterVariables}
	resultKey="collections"
	columns={COLLECTION_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
