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
	{#if category?.products?.edges.length}
		{#each category.products.edges as { node }, idx (idx)}
			<div class="rounded-md border p-1 w-1/5">
				<div class="mb-2">
					<div
						class="bg-contain bg-center bg-no-repeat w-36 h-36"
						style={`background-image: url(${node.thumbnail?.url});`}
					></div>
				</div>

				<div class="text-xs">
					<a class="w-full text-wrap" href={AppRoute.PRODUCT_DETAILS(node.slug)}>{node.name}</a>
				</div>
			</div>
		{/each}
	{/if}
</div>
