<script lang="ts">
	import { PERMISSION_GROUP_LIST_QUERY } from '$lib/api/admin/users';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		type Group,
		PermissionGroupSortField,
		type QueryPermissionGroupsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const PermissionGroupColumns: TableColumnProps<Group, PermissionGroupSortField>[] = [
		{
			title: 'Name',
			child: name,
			key: PermissionGroupSortField.Name,
		},
		{
			title: 'Users',
			child: users,
		},
	];

	let variables = $state<QueryPermissionGroupsArgs>({
		first: 10,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);
</script>

{#snippet name({ item }: { item: Group })}
	<a href={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_DETAIL(item.id)} class="link">{item.name}</a>
{/snippet}

{#snippet users({ item }: { item: Group })}
	{item.users?.length || 0}
{/snippet}

<FilterManager bind:variables bind:forceReExecuteGraphqlQuery searchKey="filter.search" />

<GraphqlPaginableTable
	query={PERMISSION_GROUP_LIST_QUERY}
	columns={PermissionGroupColumns}
	resultKey="permissionGroups"
	bind:variables
	bind:forceReExecuteGraphqlQuery
/>
