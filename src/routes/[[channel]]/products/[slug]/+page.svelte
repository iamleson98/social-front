<script lang="ts">
	import { tranFunc } from '$i18n';
	import Card from '$lib/components/common/card.svelte';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
</script>

<Card cardTitle={$tranFunc('product.prdDescription')}>
	{#if data.description.length}
		<div class="text-gray-700">
			{#each data.description as paragraph, index (index)}
				<div>{@html paragraph}</div>
			{/each}
		</div>
	{:else}
		<p>{$tranFunc('product.noDescription')}</p>
	{/if}
</Card>
