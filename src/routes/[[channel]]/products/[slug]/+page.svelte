<script lang="ts">
	import { T } from '$i18n';
	import Card from '$lib/components/common/card.svelte';
	import type { PageData } from './$types';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();
</script>

<Card cardTitle={$T('product.prdDescription')}>
	{#if data.description.length}
		<div class="text-gray-700 leading-relaxed space-y-3">
			{#each data.description as paragraph, index (index)}
				<div>{@html paragraph}</div>
			{/each}
		</div>
	{:else}
		<p class="text-gray-500">{$T('product.noDescription')}</p>
	{/if}
</Card>
