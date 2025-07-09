<script lang="ts">
	import { tranFunc } from '$i18n';
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
			title: $tranFunc('staff.avatar'),
			child: avatar,
		},
		{
			title: $tranFunc('staff.fullName'),
			key: UserSortField.FirstName,
			child: fullName,
			sortable: true,
		},
		{
			title: $tranFunc('staff.email'),
			child: email,
			sortable: true,
			key: UserSortField.Email,
		},
		{
			title: $tranFunc('staff.status'),
			child: status,
		},
	];
</script>

{#snippet avatar({ item }: { item: User })}
	<Thumbnail
		src={item.avatar?.url}
		alt={item.avatar?.alt || `${item.firstName} ${item.lastName}`}
	/>
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
	<Badge
		text={item.isActive ? $tranFunc('staff.isActive') : $tranFunc('staff.inactive')}
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

<FilterButton bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={STAFFS_QUERY}
	bind:variables
	resultKey="staffUsers"
	columns={STAFF_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
