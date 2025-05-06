<script lang="ts">
	import { Accordion } from '$lib/components/ui/Accordion';
	import Button from '$lib/components/ui/Button/Button.svelte';

	const DummyData = [
		{
			name: 'Channel 1',
			status: 'Available'
		},
		{
			name: 'Channel 2',
			status: 'Available'
		},
		{
			name: 'Channel 3',
			status: 'Available'
		},
		{
			name: 'Channel 4',
			status: 'Available'
		},
		{
			name: 'Channel 5',
			status: 'Available'
		}
	];
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3">
	<div class="flex">
		<div class="flex-1">
			Availability
			<p class="text-xs text-gray-500">In 2 of 5 channels</p>
		</div>
		<Button color="blue">Manage</Button>
	</div>

	<!-- dummy test -->
	<div class="mt-2">
		{#each DummyData as item}
			<Accordion header={item.name} open={false}>
				<p>{item.status}</p>
			</Accordion>
		{/each}
	</div>
</div>
