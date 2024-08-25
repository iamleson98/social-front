<script lang="ts">
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Progress } from '$lib/components/ui/Progress';

	const ratings = [5, 4, 3, 2, 1];
</script>

<Accordion header="Rating">
	<div>
		{#each ratings as rating, idx (idx)}
			<div class="flex items-center space-x-2 mb-1.5">
				<span class="text-xs font-semibold text-blue-500 w-1/4">{rating} Star</span>
				<div class="w-3/4">
					<Progress percent={rating * 20} />
				</div>
			</div>
		{/each}
	</div>
</Accordion>
