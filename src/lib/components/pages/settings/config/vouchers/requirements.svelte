<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { RadioButton } from '$lib/components/ui/Input';
	import { Input } from '$lib/components/ui/Input';

	type Props = {
		minimumOrderValue?: number;
		minimumQuantityOfItems?: number;
	};

	type RequirementType = 'Minimum order value' | 'Minimum quantity of items' | 'none';

	let { minimumOrderValue = $bindable(), minimumQuantityOfItems = $bindable() }: Props = $props();

	let requirementType = $state<RequirementType>('none');

	const REQUIREMENT_TYPES: RequirementType[] = [
		'none',
		'Minimum order value',
		'Minimum quantity of items',
	];
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>Minimum requirements</SectionHeader>
	<div class="space-y-2.5 mb-2">
		{#each REQUIREMENT_TYPES as type, idx (idx)}
			<RadioButton label={type} bind:group={requirementType} value={type} />
		{/each}
	</div>

	{#if requirementType === 'Minimum order value'}
		<Input placeholder="Minimum order value" type="number" min={0} bind:value={minimumOrderValue} />
	{:else if requirementType === 'Minimum quantity of items'}
		<Input
			placeholder="Minimum quantity of items"
			type="number"
			min={1}
			bind:value={minimumQuantityOfItems}
		/>
	{/if}
</div>
