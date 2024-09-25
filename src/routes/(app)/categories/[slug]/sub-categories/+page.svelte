<script lang="ts">
	import { AppRoute } from '$lib/utils';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	const { category } = data;
</script>

<div class="flex flex-row flex-wrap gap-2">
	{#if category?.children}
		{@const { children } = category}
		{#if children.edges.length}
			{#each children.edges as { node }, idx (idx)}
				<div class="rounded-md border p-1">
					<div class="mb-2">
						<div
							class="bg-contain bg-center bg-no-repeat w-36 h-36"
							style={`background-image: url(${node.backgroundImage?.url || ''});`}
						></div>
					</div>

					<div>
						<div class="text-xs">
							<a href="/">{node.name}</a>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	{/if}
</div>
