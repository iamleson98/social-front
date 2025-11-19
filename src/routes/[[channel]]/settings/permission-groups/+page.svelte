<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PERMISSION_GROUP_LIST_QUERY } from '$lib/api/admin/users';
	import { FilterManager } from '$lib/components/common/filter-box';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		type Group,
		PermissionGroupSortField,
		type QueryPermissionGroupsArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const PermissionGroupColumns: TableColumnProps<Group, PermissionGroupSortField>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: name,
			key: PermissionGroupSortField.Name,
			width: '50%',
		},
		{
			title: $tranFunc('settings.users'),
			child: { render: ({ item }) => item.users?.length || 0 },
		},
	]);

	let variables = $state<QueryPermissionGroupsArgs>({
		first: 10,
		filter: { search: '' },
	});
	let tableRef = $state<GraphqlPaginableTableInterface>();
</script>

{#snippet name({ item }: { item: Group })}
	<a href={AppRoute.SETTINGS_CONFIGS_PERMISSION_GROUP_DETAIL(item.id)} class="link">{item.name}</a>
{/snippet}

<div class="mb-2">
	<FilterManager
		bind:variables
		onRefetchData={() => tableRef?.triggerFetchData()}
		searchKey="filter.search"
	/>
</div>

<GraphqlPaginableTable
	query={PERMISSION_GROUP_LIST_QUERY}
	columns={PermissionGroupColumns}
	resultKey="permissionGroups"
	bind:variables
	bind:this={tableRef}
/>
