<script lang="ts">
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Channel, Query } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY
	});

	const CHANNEL_COLUMNS: TableColumnProps<Channel>[] = [
		{
			title: 'Name',
			key: 'name',
			child: name,
			sortable: true
		},
		{
			title: 'Status',
			child: status
		}
	];
</script>

{#snippet name({ item }: { item: Channel })}
	<a href="{AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.slug)}" class="link">{item.name}</a>
{/snippet}

{#snippet status({ item }: { item: Channel })}
	{#if item.isActive}
		<Badge text="Active" color="green" variant="light" />
	{:else}
		<Badge text="Inactive" color="red" variant="light" />
	{/if}
{/snippet}

{#if $channelsQuery.fetching}
	<TableSkeleton numColumns={3} />
{:else if $channelsQuery.error}
	<Alert variant="warning" size="sm" bordered>
		{$channelsQuery.error.message}
	</Alert>
{:else if $channelsQuery.data}
	<div class="p-3 bg-white rounded-lg border border-gray-200">
		<Table columns={CHANNEL_COLUMNS} items={$channelsQuery.data?.channels || []} />
	</div>
{/if}
