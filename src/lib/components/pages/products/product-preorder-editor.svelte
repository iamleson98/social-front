<script lang="ts">
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';

	type Preorder = {
		isPreorder: boolean;
		daysToShip: number;
	};

	type ProductCondition = {
		isNew: boolean;
		qualityPercent?: number; // if new, then this is not needed
	};

	let preorderData = $state<Preorder>({
		isPreorder: false,
		daysToShip: 0
	});

	// let productCondition = $state.raw<ProductCondition>({
	// 	isNew: true
	// });
</script>

<div class="rounded-lg bg-gray-50 border border-gray-200 p-3">
	<!-- Preorder -->
	<div class="flex items-center gap-2">
		<div class="w-1/2 tablet:w-full">
			<Checkbox bind:checked={preorderData.isPreorder} label="Is Preorder" />
		</div>
		{#if preorderData.isPreorder}
			<div class="w-1/2 tablet:w-full">
				<Input
					type="number"
					placeholder="Days to ship"
					bind:value={preorderData.daysToShip}
					label="Days to ship"
					size="sm"
					subText="(7 to 30 days)"
				/>
			</div>
		{/if}
	</div>

	<!-- Condition -->
</div>
