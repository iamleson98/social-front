<script lang="ts">
	type Preorder = {
		isPreorder: boolean;
		daysToShip: number;
	};

	type ProductCondition = {
		isNew: boolean;
		qualityPercent?: number; // if new, then this is not needed
	};

	let preorderData = $state.frozen<Preorder>({
		isPreorder: false,
		daysToShip: 0
	});

	let productCondition = $state.frozen<ProductCondition>({
		isNew: true
	});
</script>

<div class="flex flex-row items-center">
	<div>
		<input type="radio" name="radio-7" class="radio radio-info" />
		<input type="radio" name="radio-7" class="radio radio-info" />
	</div>
</div>
