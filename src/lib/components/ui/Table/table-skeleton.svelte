<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import Table from './table.svelte';

	type Props = {
		numColumns: number;
		numOfRows?: number;
		showPagination?: boolean;
		class?: string;
	};

	type Item = {
		[x: string]: unknown;
	};

	let { numColumns, numOfRows = 3, showPagination = false, class: className = '' }: Props = $props();

	let columns = $derived.by(() =>
		new Array(numColumns).fill(null).map(() => ({
			title: '',
			child: nooptd,
		})),
	);
</script>

{#snippet nooptd({}: { item: Item })}
	<SkeletonContainer>
		<Skeleton class="h-4" />
	</SkeletonContainer>
{/snippet}

<div class="bg-white rounded-lg p-3 border border-gray-200 {className}">
	<Table {columns} items={new Array(numOfRows).fill(null).map(() => ({}))} />
	{#if showPagination}
		<div class="flex items-center justify-between p-2">
			<Skeleton class="h-4 w-20" />
			<Skeleton class="h-4 w-20" />
		</div>
	{/if}
</div>
