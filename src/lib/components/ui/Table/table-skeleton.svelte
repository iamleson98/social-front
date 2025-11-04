<script lang="ts">
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import Table from './table.svelte';

	type Props = {
		numColumns: number;
		numOfRows?: number;
		class?: string;
		headless?: boolean;
	};

	type Item = {
		[x: string]: unknown;
	};

	let { numColumns, numOfRows = 3, class: className = '', headless = false }: Props = $props();

	const Columns = new Array(numColumns).fill(null).map(() => ({
		title: '',
		child: nooptd,
	}));
</script>

{#snippet nooptd({}: { item: Item })}
	<SkeletonContainer>
		<Skeleton class="h-4" />
	</SkeletonContainer>
{/snippet}

<div class="bg-white rounded-lg p-3 border border-gray-200 {className}">
	<Table
		columns={Columns}
		items={new Array(numOfRows).fill(null).map(() => ({}))}
		{headless}
		class=""
	/>
</div>
