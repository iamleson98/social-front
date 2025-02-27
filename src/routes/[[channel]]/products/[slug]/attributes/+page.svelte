<script lang="ts">
	import Card from '$lib/components/common/card.svelte';
	import { formatSelectedAttributeValue } from '$lib/utils/utils';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<Card cardTitle="Product Attributes">
	{#each data.attributes as selectedAttribute, idx (idx)}
		<div class="flex items-center mb-2  text-sm">
			<div class="w-1/6">
				{selectedAttribute.attribute.name}
			</div>
			<div class="">
				{formatSelectedAttributeValue(selectedAttribute)}
			</div>
		</div>
	{/each}
</Card>
