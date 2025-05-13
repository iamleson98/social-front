<script lang="ts">
	import { Accordion } from '$lib/components/ui/Accordion';
	import {
		OrderSortField,
		type Address,
		type MetadataInput,
		type Order,
		type QueryOrdersArgs
	} from '$lib/gql/graphql';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import MetadataEditor from '../../common/metadata-editor.svelte';

	type Props = {
		id: string;
		addresses: Address[];
		metadata: MetadataInput[];
		privateMetadata: MetadataInput[];
	};

	let {
		id,
		addresses,
		metadata = $bindable([]),
		privateMetadata = $bindable([])
	}: Props = $props();

	let filterVariables = $state<QueryOrdersArgs>({
		first: 10,
		after: null,
		last: null,
		before: null
	});

	let forceReExecuteGraphqlQuery = $state(true);

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, OrderSortField>[] = [
		{
			title: 'Number',
			child: number
		},
		{
			title: 'Date',
			child: date
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Total',
			child: total
		}
	];
</script>

{#snippet number({ item }: { item: Order })}
	<span>{item.number}</span>
{/snippet}
{#snippet date({ item }: { item: Order })}
	<span>{item.created}</span>
{/snippet}
{#snippet status({ item }: { item: Order })}
	<span>{item.status}</span>
{/snippet}
{#snippet total({ item }: { item: Order })}
	<span>{item.total}</span>
{/snippet}
<div class="bg-white rounded-lg border border-gray-200 p-3 pb-6 flex flex-col gap-3 flex-1">
	<Accordion header="Recent orders">
		<div>
			<GraphqlPaginableTable
				query={USER_ORDERS_QUERY}
				bind:variables={filterVariables}
				resultKey="orders"
				columns={ORDER_TABLE_COLUMNS}
				bind:forceReExecuteGraphqlQuery
			/>
		</div>
	</Accordion>

	<Accordion header="Address information">
		{#if addresses.length > 0}
			{#each addresses as address}
				<div>
					{address.companyName} - {address.streetAddress1} - {address.city} - {address.cityArea}
				</div>
			{/each}
		{:else}
			<span class="text-gray-500 text-sm">No addresses</span>
		{/if}
	</Accordion>

	<MetadataEditor title="Metadata" bind:data={metadata} />
	<MetadataEditor title="Private Metadata" bind:data={privateMetadata} />
</div>
