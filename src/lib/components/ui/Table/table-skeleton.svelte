<script lang="ts">
	import { Skeleton, SkeletonContainer } from '../Skeleton';
	import Table from './table.svelte';

	type Props = {
		numColumns: number;
		numOfRows?: number;
		showPagination?: boolean;
	};

	let { numColumns, numOfRows = 3, showPagination = false }: Props = $props();

	let columns = $derived.by(() =>
		new Array(numColumns).fill(null).map(() => ({
			title: '',
			child: nooptd
		}))
	);

	$inspect(columns);
</script>

{#snippet nooptd({}: { item: Record<string, unknown> })}
	<SkeletonContainer>
		<Skeleton class="h-4" />
	</SkeletonContainer>
{/snippet}

<Table {columns} items={new Array(numOfRows).fill(null).map(() => ({}))} />
{#if showPagination}
	<div class="flex items-center justify-between p-2">
		<Skeleton class="h-4 w-20" />
		<Skeleton class="h-4 w-20" />
	</div>
{/if}
