<script lang="ts">
	import { QUERY_CUSTOMERS } from '$lib/api/admin/users';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Query, QueryCustomersArgs, User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import dayjs from 'dayjs';

	const usersQuery = operationStore<Pick<Query, 'customers'>, QueryCustomersArgs>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: QUERY_CUSTOMERS,
		variables: {
			first: 20
		}
	});

	const USER_TABLE_COLUMNS: TableColumnProps<User>[] = [
		{
			title: 'Avatar',
			child: avatar
		},
		{
			title: 'First Name',
			child: firstName
		},
		{
			title: 'Last Name',
			child: lastName
		},
		{
			title: 'Email',
			child: email
		},
		{
			title: 'Status',
			child: isActive
		},
		{
			title: 'Is Staff',
			child: isStaff
		},
		{
			title: 'Joined At',
			child: dateJoined
		}
	];
</script>

{#snippet avatar({ item }: { item: User })}
	{#if item.avatar}
		<div class="w-8 h-8 rounded-full overflow-hidden">
			<img src={item.avatar?.url} alt={item.avatar?.alt} />
		</div>
	{:else}
		<div class="w-8 h-8 justify-center items-center flex rounded-full overflow-hidden bg-blue-500">
			<span class="text-xs font-medium text-white"
				>{`${item.firstName[0] || item.email[0]}${item.lastName[0] || ''}`.toUpperCase()}</span
			>
		</div>
	{/if}
{/snippet}

{#snippet firstName({ item }: { item: User })}
	<a href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(item.id)} class="link">{item.firstName}</a>
{/snippet}

{#snippet lastName({ item }: { item: User })}
	<span>{item.lastName}</span>
{/snippet}

{#snippet email({ item }: { item: User })}
	<span>{item.email}</span>
{/snippet}

{#snippet isActive({ item }: { item: User })}
	{#if item.isActive}
		<Badge text="Active" color="green" />
	{:else}
		<Badge text="Inactive" color="red" />
	{/if}
{/snippet}

{#snippet isStaff({ item }: { item: User })}
	{#if item.isStaff}
		<Badge text="Yes" color="green" variant="light" />
	{:else}
		<Badge text="No" color="red" variant="light" />
	{/if}
{/snippet}

{#snippet dateJoined({ item }: { item: User })}
	<span>{dayjs(item.dateJoined).format('DD/MM/YYYY')}</span>
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-4">
	{#if $usersQuery.fetching}
		<TableSkeleton numColumns={3} />
	{:else if $usersQuery.error}
		<Alert variant="error" size="sm" bordered>
			{$usersQuery.error.message}
		</Alert>
	{:else if $usersQuery.data}
		<Table
			columns={USER_TABLE_COLUMNS}
			items={$usersQuery.data?.customers?.edges.map((edge) => edge.node) || []}
      pagination={$usersQuery.data.customers?.pageInfo}
		/>
	{/if}
</div>
