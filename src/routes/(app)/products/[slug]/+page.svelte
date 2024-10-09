<script lang="ts">
	import { tClient } from '$i18n';
	import Card from '$lib/components/common/card.svelte';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
</script>

<Card cardTitle={tClient('product.prdDescription')}>
	{#if data.description.length}
		<div class="text-gray-700">
			{#each data.description as paragraph, index (index)}
				<div>{@html paragraph}</div>
			{/each}
		</div>
	{:else}
		<p>{tClient('product.noDescription')}</p>
	{/if}
</Card>
