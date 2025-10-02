<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CUSTOMER_LIST_QUERY } from '$lib/api/admin/users';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import CustomerFilter from '$lib/components/pages/settings/customers/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { type TableColumnProps } from '$lib/components/ui/Table';
	import GraphqlPaginableTable from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { UserSortField, type QueryCustomersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { BASIC_DATE_FORMAT, CommonEaseDatePickerFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	let filterVariables = $state<QueryCustomersArgs>({
		filter: {
			search: '',
		},
		first: 10,
	});
	let forceReExecuteGraphqlQuery = $state(true);

	const USER_TABLE_COLUMNS: TableColumnProps<User, UserSortField>[] = $derived([
		{
			title: $tranFunc('staff.avatar'),
			child: avatar,
		},
		{
			title: $tranFunc('common.name'),
			child: customerName,
			key: UserSortField.FirstName,
		},
		{
			title: $tranFunc('common.email'),
			child: email,
			key: UserSortField.Email,
		},
		{
			title: $tranFunc('staff.status'),
			child: isActive,
		},
		{
			title: $tranFunc('customer.isStaff'),
			child: isStaff,
		},
		{
			title: $tranFunc('staff.joinedSince'),
			child: dateJoined,
			key: UserSortField.CreatedAt,
		},
	]);
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
	<Badge
		text={$tranFunc(item.isActive ? 'staff.active' : 'staff.inactive')}
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

{#snippet isStaff({ item }: { item: User })}
	<div class="text-center">
		<Badge
			text={$tranFunc(item.isStaff ? 'common.yes' : 'common.no')}
			color={item.isStaff ? 'green' : 'red'}
		/>
	</div>
{/snippet}

{#snippet dateJoined({ item }: { item: User })}
	<span>{dayjs(item.dateJoined).format(CommonEaseDatePickerFormat)}</span>
{/snippet}

<div class="mb-2">
	<CustomerFilter bind:variables={filterVariables} bind:forceReExecuteGraphqlQuery />
</div>

<GraphqlPaginableTable
	query={CUSTOMER_LIST_QUERY}
	bind:variables={filterVariables}
	resultKey="customers"
	columns={USER_TABLE_COLUMNS}
	bind:forceReExecuteGraphqlQuery
	class="bg-white rounded-lg border border-gray-200 p-3"
/>
