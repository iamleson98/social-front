<script lang="ts">
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/api';
	import { OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import IconButton from '$lib/components/ui/Button/IconButton.svelte';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, Query } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'First Column',
			child: firstColumn,
		},
		{
			title: 'Second Column',
			child: secondColumn,
		},
		{
			title: 'Third Column',
			child: thirdColumn,
		},
		{
			title: 'Action Column',
			child: actionColumn,
		},
	];

	let disabledTable = $state(false);
	let disabledGraphqlTable = $state(false);

	let sortMultipleTable = $state(false);
	let sortMultipleGraphqlTable = $state(false);

	const handleCopyNormalTable = () => {
		const code = `<Table
			disabled={${disabledTable}}
			items={[]}
			columns={PRODUCT_COLUMNS}
			sortMultiple={${sortMultipleTable}}
		/>`;
		navigator.clipboard.writeText(code).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${code}`,
				timeout: 5000,
			});
		});
	};

	const handleCopyGraphqlTable = () => {
		const code = `<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_STORE}
			variables={{ first: 10 }}
			resultKey={'products' as keyof Query}
			columns={PRODUCT_COLUMNS}
			disabled={${disabledGraphqlTable}}
			sortMultiple={${sortMultipleGraphqlTable}}
			forceReExecuteGraphqlQuery={true}
		/>`;
		navigator.clipboard.writeText(code).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${code}`,
				timeout: 5000,
			});
		});
	};
</script>

<!-- Snippets -->
{#snippet firstColumn({ item }: { item: Product })}<div>{item.id}</div>{/snippet}
{#snippet secondColumn({ item }: { item: Product })}<div>{item.name}</div>{/snippet}
{#snippet thirdColumn({ item }: { item: Product })}
	{#if item.isAvailable}
		<Badge text="Available" color="green" />
	{:else}
		<Badge text="Not Available" color="red" />
	{/if}
{/snippet}
{#snippet actionColumn({ item }: { item: Product })}
	<IconButton variant="outline" size="xs" onclick={() => {}} icon={OpenEye} />
{/snippet}

<!-- Normal Table -->
<div class="rounded-md p-4 bg-white border mb-4">
	<h2 class="text-lg font-semibold mb-2">Normal Table</h2>
	<div class="flex gap-4 mb-2">
		<Checkbox bind:checked={disabledTable} label="Disabled" />
		<Checkbox bind:checked={sortMultipleTable} label="Sort Multiple" />
	</div>
	<Table
		items={[]}
		columns={PRODUCT_COLUMNS}
		disabled={disabledTable}
		sortMultiple={sortMultipleTable}
	/>
	<Button class="mt-2" onclick={handleCopyNormalTable}>Copy Normal Table</Button>
</div>

<!-- GraphQL Table -->
<div class="rounded-md p-4 bg-white border">
	<h2 class="text-lg font-semibold mb-2">GraphQL Table</h2>
	<div class="flex gap-4 mb-2">
		<Checkbox bind:checked={disabledGraphqlTable} label="Disabled" />
		<Checkbox bind:checked={sortMultipleGraphqlTable} label="Sort Multiple" />
	</div>
	<GraphqlPaginableTable
		query={PRODUCT_LIST_QUERY_STORE}
		variables={{ first: 3 }}
		resultKey={'products' as keyof Query}
		columns={PRODUCT_COLUMNS}
		disabled={disabledGraphqlTable}
		sortMultiple={sortMultipleGraphqlTable}
		forceReExecuteGraphqlQuery={true}
	/>
	<Button class="mt-2" onclick={handleCopyGraphqlTable}>Copy GraphQL Table</Button>
</div>
