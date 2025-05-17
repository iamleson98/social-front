<script lang="ts">
	import { QUERY_CUSTOMERS } from '$lib/api/admin/users';
	import { Badge } from '$lib/components/ui/badge';
	import { type TableColumnProps } from '$lib/components/ui/Table';
	import {
		UserSortField,
		type CustomerFilterInput,
		type QueryCustomersArgs,
		type User,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import dayjs from 'dayjs';
	import CustomerFilter from '$lib/components/pages/settings/config/customers/filter.svelte';
	import type { FilterResult } from '$lib/components/common/filter-box';
	import { DebounceInput } from '$lib/components/ui/Input';
	import { Search } from '$lib/components/icons';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';

	let filterVariables = $state<QueryCustomersArgs>({
		filter: {},
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const onFilterChange = (newFilter: FilterResult<CustomerFilterInput>) => {
		filterVariables = {
			...filterVariables,
			filter: newFilter as CustomerFilterInput,
		};
		forceReExecuteGraphqlQuery = true;
	};

	const USER_TABLE_COLUMNS: TableColumnProps<User, UserSortField>[] = [
		{
			title: 'Avatar',
			child: avatar,
		},
		{
			title: 'First Name',
			child: firstName,
			sortable: true,
			key: UserSortField.FirstName,
		},
		{
			title: 'Last Name',
			child: lastName,
			sortable: true,
			key: UserSortField.LastName,
		},
		{
			title: 'Email',
			child: email,
			sortable: true,
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
			sortable: true,
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

<div class="flex items-center gap-2 mb-2">
	<CustomerFilter {onFilterChange} />
	<DebounceInput
		debounceTime={500}
		bind:value={filterVariables.filter!.search}
		placeholder="Search"
		size="sm"
		startIcon={Search}
	/>
</div>

<GraphqlPaginableTable
	query={QUERY_CUSTOMERS}
	bind:variables={filterVariables}
	resultKey="customers"
	columns={USER_TABLE_COLUMNS}
	bind:forceReExecuteGraphqlQuery
/>
