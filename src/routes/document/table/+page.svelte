<script lang="ts">
	import { PRODUCT_LIST_QUERY_STORE } from '$lib/api';
	import { COLLECTION_PRODUCTS_QUERY } from '$lib/api/admin/collections';
	import { OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import IconButton from '$lib/components/ui/Button/IconButton.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Product, ProductOrderField, Query } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';

	let loading = $state(false);
	let isNormalTable = $state(true);
	let numFilter = $state(5);
	let numColumn = $state(5);
	let numRow = $state(3);

	const PRODUCT_COLUMNS: TableColumnProps<Product, ProductOrderField>[] = [
		{
			title: 'First Column',
			child: firstColumn
		},
		{
			title: 'Second Column',
			child: secondColumn
		},
		{
			title: 'Third Column',
			child: thirdColumn
		},
		{
			title: 'Action Column',
			child: actionColumn
		}
	];

	const handleCopyButton = () => {
		let codeContent = '';
		if (isNormalTable) {
			if (loading) {
				codeContent = `<SkeletonContainer>
					{#each Array.from({ length: ${numRow} }) as _, idx (idx)}
						<div class="flex gap-4">
							{#each Array.from({ length: ${numColumn} }) as _, colIdx (colIdx)}
								<Skeleton class="h-8 w-full flex-1" />
							{/each}
						</div>
					{/each}
				</SkeletonContainer>`;
			} else {
				codeContent = `<div class="rounded-md p-2 bg-white">
					<Table items={[]} columns={PRODUCT_COLUMNS}/>
				</div>`;
			}
		} else {
			codeContent = `<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_STORE}
			variables={{ first: ${numFilter} }}
			resultKey={'products' as keyof Query}
			columns={PRODUCT_COLUMNS}
			forceReExecuteGraphqlQuery={true}
			disabled={true}
		/>`;
		}

		navigator.clipboard.writeText(codeContent).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${codeContent}`,
				timeout: 5000
			});
		});
	};
</script>

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

<!-- Khi checkbox được bật/tắt, biến loading sẽ tự thay đổi -->
<Checkbox bind:checked={loading} label={loading ? 'Loading' : 'Not loading'} />
<Checkbox bind:checked={isNormalTable} label="Normal Table" />

{#if isNormalTable}
	<div class="flex">
		<Input type="number" bind:value={numColumn} label="Number of columns" />
	</div>
	{#if loading}
		<SkeletonContainer class="space-y-2">
			{#each Array.from({ length: numRow }) as _, rowIdx (rowIdx)}
				<div class="flex gap-4">
					{#each Array.from({ length: numColumn }) as _, colIdx (colIdx)}
						<Skeleton class="h-8 w-full flex-1" />
					{/each}
				</div>
			{/each}
		</SkeletonContainer>
	{:else}
		<div class="rounded-md p-2 bg-white">
			<Table items={[]} columns={PRODUCT_COLUMNS} />
		</div>
	{/if}
{/if}

{#if !isNormalTable}
	<Input type="number" bind:value={numFilter} />
	<div class="rounded-md p-2">
		<GraphqlPaginableTable
			query={PRODUCT_LIST_QUERY_STORE}
			variables={{ first: numFilter }}
			resultKey={'products' as keyof Query}
			columns={PRODUCT_COLUMNS}
			forceReExecuteGraphqlQuery={true}
			disabled={true}
		/>
	</div>
{/if}

<Button onclick={handleCopyButton}>Copy</Button>
