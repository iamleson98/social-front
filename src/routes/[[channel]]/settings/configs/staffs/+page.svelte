<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Table, TableSkeleton, type SortState, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Query, User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { onMount } from 'svelte';

	const staffsQuery = operationStore<Pick<Query, 'staffUsers'>>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: STAFFS_QUERY
	});

	let allStaffs = $state<User[]>([]);

	onMount(() =>
		staffsQuery.subscribe((data) => {
			if (data?.data) {
				allStaffs = data.data.staffUsers?.edges.map((edge) => edge.node) || [];
			}
		})
	);

	const STAFF_COLUMNS: TableColumnProps<User>[] = [
		{
			title: 'Full name',
			key: 'name',
			child: fullName,
			sortable: true
		},
		{
			title: 'Email',
			child: email
		},
		{
			title: 'Status',
			child: status
		}
	];

  const handleSortChange = (state: SortState) => {
		if (state['name'] === 'asc') {
			allStaffs.sort((f, s) => (f.firstName < s.firstName ? -1 : 1));
		} else if (state['name'] === 'desc') {
			allStaffs.sort((f, s) => (f.firstName > s.firstName ? -1 : 1));
		}
	};
</script>

{#snippet fullName({ item }: { item: User })}
	<div class="flex items-center gap-2">
		{#if item.avatar}
			<div class="w-8 h-8 rounded-full overflow-hidden">
				<img src={item.avatar?.url} alt={item.avatar?.alt} />
			</div>
		{:else}
			<div
				class="w-8 h-8 justify-center items-center flex rounded-full overflow-hidden bg-blue-500"
			>
				<span class="text-xs font-medium text-white"
					>{`${item.firstName[0] || item.email[0]}${item.lastName[0] || ''}`.toUpperCase()}</span
				>
			</div>
		{/if}
		<a href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(item.id)}>{item.firstName} {item.lastName}</a>
	</div>
{/snippet}

{#snippet email({ item }: { item: User })}
	{item.email}
{/snippet}

{#snippet status({ item }: { item: User })}
	{#if item.isActive}
		<Badge text="Active" color="green" variant="light" />
	{:else}
		<Badge text="Inactive" color="red" variant="light" />
	{/if}
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-4">
	{#if $staffsQuery.fetching}
		<TableSkeleton numColumns={3} />
	{:else if $staffsQuery.error}
		<Alert variant="error" size="sm" bordered>
			{$staffsQuery.error.message}
		</Alert>
	{:else if $staffsQuery.data}
		<Table
			columns={STAFF_COLUMNS}
			items={allStaffs}
			scale="sm"
      onSortChange={handleSortChange}
		/>
	{/if}
</div>
