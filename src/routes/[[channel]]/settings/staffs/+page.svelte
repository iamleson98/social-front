<script lang="ts">
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import FilterButton from '$lib/components/pages/settings/config/staff/filter-button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type QueryStaffUsersArgs, type User, UserSortField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: { search: '' },
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const STAFF_COLUMNS: TableColumnProps<User, UserSortField>[] = [
		{
			title: 'Avatar',
			child: avatar,
		},
		{
			title: 'Full Name',
			key: UserSortField.FirstName,
			child: fullName,
			sortable: true,
		},
		{
			title: 'Email',
			child: email,
			sortable: true,
			key: UserSortField.Email,
		},
		{
			title: 'Status',
			child: status,
		},
	];
</script>

{#snippet avatar({ item }: { item: User })}
	<Thumbnail src={item.avatar?.url} alt={item.avatar?.alt || `${item.firstName} ${item.lastName}`} />
{/snippet}

{#snippet fullName({ item }: { item: User })}
	<a class="link link-hover" href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(item.id)}>
		{item.firstName}
		{item.lastName}
	</a>
{/snippet}

{#snippet email({ item }: { item: User })}
	<span>{item.email}</span>
{/snippet}

{#snippet status({ item }: { item: User })}
	<Badge text={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'green' : 'red'} />
{/snippet}

<FilterButton bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={STAFFS_QUERY}
	bind:variables
	resultKey="staffUsers"
	columns={STAFF_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
