<script lang="ts">
	import { T } from '$i18n';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import CustomerFilter from '$lib/components/pages/settings/customers/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import {
		type GraphqlPaginableTableInterface,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { UserSortField, type QueryCustomersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonEaseDatePickerFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let filterVariables = $state<QueryCustomersArgs>({
		filter: {
			search: '',
		},
		first: 10,
	});

	const USER_TABLE_COLUMNS: TableColumnProps<User, UserSortField>[] = $derived([
		{
			title: $T('staff.avatar'),
			child: avatar,
		},
		{
			title: $T('common.name'),
			child: customerName,
			key: UserSortField.FirstName,
		},
		{
			title: $T('common.email'),
			child: email,
			key: UserSortField.Email,
		},
		{
			title: $T('staff.status'),
			child: isActive,
		},
		{
			title: $T('customer.isStaff'),
			child: isStaff,
		},
		{
			title: $T('staff.joinedSince'),
			child: dateJoined,
			key: UserSortField.CreatedAt,
		},
	]);
	let tableRef = $state<GraphqlPaginableTableInterface>();
</script>

{#snippet avatar({ item }: TableCellProps<User>)}
	<Thumbnail
		size="sm"
		src={item.avatar?.url}
		alt={`${item.firstName[0] || item.email[0]}${item.lastName[0] || item.email[1]}`.toUpperCase()}
	/>
{/snippet}

{#snippet customerName({ item }: TableCellProps<User>)}
	<a href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(item.id)} class="link">
		{#if item.firstName || item.lastName}
			<span>{item.firstName} {item.lastName}</span>
		{:else}
			<span>{item.email.split('@')[0]}</span>
		{/if}
	</a>
{/snippet}

{#snippet email({ item }: TableCellProps<User>)}
	<span>{item.email}</span>
{/snippet}

{#snippet isActive({ item }: TableCellProps<User>)}
	<Badge
		text={$T(item.isActive ? 'staff.active' : 'staff.inactive')}
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

{#snippet isStaff({ item }: TableCellProps<User>)}
	<div class="text-center">
		<Badge
			text={$T(item.isStaff ? 'common.yes' : 'common.no')}
			color={item.isStaff ? 'green' : 'red'}
		/>
	</div>
{/snippet}

{#snippet dateJoined({ item }: TableCellProps<User>)}
	<span>{dayjs(item.dateJoined).format(CommonEaseDatePickerFormat)}</span>
{/snippet}

<div class="mb-2">
	<CustomerFilter bind:variables={filterVariables} {tableRef} />
</div>

<GraphqlPaginableTable
	query={CUSTOMER_LIST_QUERY}
	bind:variables={filterVariables}
	resultKey="customers"
	columns={USER_TABLE_COLUMNS}
	bind:this={tableRef}
/>
