<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PERMISSION_GROUP_LIST_QUERY } from '$lib/api/admin/users';
	import { FilterManager } from '$lib/components/common/filter-box';
	import {
		GraphqlPaginableTable,
		reFetchTableData,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import {
		type Group,
		PermissionGroupSortField,
		type QueryPermissionGroupsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const PermissionGroupColumns: TableColumnProps<Group, PermissionGroupSortField>[] = [
		{
			title: $tranFunc('common.name'),
			child: name,
			key: PermissionGroupSortField.Name,
		},
		{
			title: $tranFunc('settings.users'),
			child: users,
		},
	];

	let variables = $state<QueryPermissionGroupsArgs>({
		first: 10,
		filter: { search: '' },
	});
</script>

{#snippet name({ item }: { item: Group })}
	<a href={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_DETAIL(item.id)} class="link">{item.name}</a>
{/snippet}

{#snippet users({ item }: { item: Group })}
	{item.users?.length || 0}
{/snippet}

<div class="mb-2">
	<FilterManager
		bind:variables
		onRefetchData={() => reFetchTableData(TableNameKeys.PermissionGroupsTable)}
		searchKey="filter.search"
	/>
</div>

<GraphqlPaginableTable
	query={PERMISSION_GROUP_LIST_QUERY}
	columns={PermissionGroupColumns}
	resultKey="permissionGroups"
	bind:variables
	tableName={TableNameKeys.PermissionGroupsTable}
/>
