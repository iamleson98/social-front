<script lang="ts">
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import FilterButton from '$lib/components/pages/settings/config/staff/filter-button.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type QueryStaffUsersArgs, type User, UserSortField } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let filterVariables = $state<QueryStaffUsersArgs>({
		first: 10
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
			key: UserSortField.Email
		},
		{
			title: 'Status',
			child: status
		}
	];
</script>

{#snippet avatar({ item }: { item: User })}
	<div class="w-8 h-8 justify-center items-center flex rounded-full overflow-hidden bg-blue-500">
		{#if item.avatar}
			<img src={item.avatar?.url} alt={item.avatar?.alt} />
		{:else}
			<span class="text-xs font-medium text-white">
				{`${item.firstName[0] || item.email[0]}${item.lastName[0] || ''}`.toUpperCase()}
			</span>
		{/if}
	</div>
{/snippet}

{#snippet fullName({ item }: { item: User })}
	<a class="link" href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(item.id)}>
		{item.firstName}
		{item.lastName}
	</a>
{/snippet}

{#snippet email({ item }: { item: User })}
	{item.email}
{/snippet}

{#snippet status({ item }: { item: User })}
	{#if item.isActive}
		<Badge text="Active" color="green" />
	{:else}
		<Badge text="Inactive" color="red" variant="light" />
	{/if}
{/snippet}

<div class="mb-2">
	<FilterButton />
</div>

<GraphqlPaginableTable
	query={STAFFS_QUERY}
	variables={filterVariables}
	resultKey="staffUsers"
	columns={STAFF_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
