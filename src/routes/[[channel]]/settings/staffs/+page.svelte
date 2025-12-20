<script lang="ts">
	import { T } from '$i18n';
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import FilterButton from '$lib/components/pages/settings/staff/filter-button.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { type QueryStaffUsersArgs, type User, UserSortField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: { search: '' },
	});

	const STAFF_COLUMNS: TableColumnProps<User, UserSortField>[] = $derived([
		{
			title: $T('staff.avatar'),
			child: avatar,
		},
		{
			title: $T('staff.fullName'),
			key: UserSortField.FirstName,
			child: fullName,
		},
		{
			title: $T('staff.email'),
			child: { render: ({ item }) => item.email },
			key: UserSortField.Email,
		},
		{
			title: $T('staff.status'),
			child: status,
		},
	]);
	let tableRef = $state<GraphqlPaginableTableInterface>();
</script>

{#snippet avatar({ item }: { item: User })}
	<Thumbnail
		src={item.avatar?.url}
		alt={item.avatar?.alt || `${item.firstName} ${item.lastName}`}
	/>
{/snippet}

{#snippet fullName({ item }: { item: User })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(item.id)}>
		{item.firstName}
		{item.lastName}
	</a>
{/snippet}

{#snippet status({ item }: { item: User })}
	<Badge
		text={item.isActive ? $T('staff.active') : $T('staff.inactive')}
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

<div class="mb-2">
	<FilterButton bind:variables {tableRef} />
</div>

<GraphqlPaginableTable
	query={STAFFS_QUERY}
	bind:variables
	resultKey="staffUsers"
	columns={STAFF_COLUMNS}
	bind:this={tableRef}
/>
