<script lang="ts">
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import { Badge } from '$lib/components/ui/Badge';
	import { type TableColumnProps } from '$lib/components/ui/Table';
	import { UserSortField, type QueryCustomersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import dayjs from 'dayjs';
	import CustomerFilter from '$lib/components/pages/settings/customers/filter.svelte';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';

	let filterVariables = $state<QueryCustomersArgs>({
		filter: {
			search: '',
		},
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const USER_TABLE_COLUMNS: TableColumnProps<User, UserSortField>[] = [
		{
			title: 'Avatar',
			child: avatar,
		},
		{
			title: 'Customer name',
			child: customerName,
			key: UserSortField.FirstName,
		},
		{
			title: 'Email',
			child: email,
			key: UserSortField.Email,
		},
		{
			title: 'Status',
			child: isActive,
		},
		{
			title: 'Is Staff',
			child: isStaff,
		},
		{
			title: 'Joined At',
			child: dateJoined,
			key: UserSortField.CreatedAt,
		},
	];
</script>

{#snippet avatar({ item }: { item: User })}
	<Thumbnail
		size="sm"
		src={item.avatar?.url}
		alt={`${item.firstName[0] || item.email[0]}${item.lastName[0] || item.email[1]}`.toUpperCase()}
	/>
{/snippet}

{#snippet customerName({ item }: { item: User })}
	<a href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(item.id)} class="link">
		{#if item.firstName || item.lastName}
			<span>{item.firstName} {item.lastName}</span>
		{:else}
			<span>{item.email.split('@')[0]}</span>
		{/if}
	</a>
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
	<div class="text-center">
		{#if item.isStaff}
			<Badge text="Yes" color="green" variant="light" />
		{:else}
			<Badge text="No" color="red" variant="light" />
		{/if}
	</div>
{/snippet}

{#snippet dateJoined({ item }: { item: User })}
	<span>{dayjs(item.dateJoined).format('DD/MM/YYYY HH:mm')}</span>
{/snippet}

<CustomerFilter bind:variables={filterVariables} bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={CUSTOMER_LIST_QUERY}
	bind:variables={filterVariables}
	resultKey="customers"
	columns={USER_TABLE_COLUMNS}
	bind:forceReExecuteGraphqlQuery
	class="bg-white rounded-lg border border-gray-200 p-3"
/>
