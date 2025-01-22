<script lang="ts">
	import { tClient } from '$i18n';
	import { Checkbox, Input } from '$lib/components/ui/Input';

	type Preorder = {
		isPreorder: boolean;
		daysToShip: number;
	};

	let preorderData = $state<Preorder>({
		isPreorder: false,
		daysToShip: 0
	});
</script>

<div class="mb-3">
	<span class="text-sm">{tClient('common.preorder')}</span>
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
	</div>
</div>
