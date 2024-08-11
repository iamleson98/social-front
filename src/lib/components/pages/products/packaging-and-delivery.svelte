<script lang="ts">
	type PackageAndDelivery = {
		weight: number;
		length: number;
		width: number;
		height: number;
	};

	let packageAndDeliveryData = $state<PackageAndDelivery>({
		weight: 0,
		length: 0,
		width: 0,
		height: 0
	});
</script>

<div class="flex items-center text-xs gap-1">
	<label for="" class="form-control">
		<div>Weight</div>
		<input type="number" placeholder="weight" value={packageAndDeliveryData.weight} class="input" />
	</label>
	<div class="flex items-center gap-1">
		<label for="" class="form-control">
			<div>Length</div>
			<input type="number" placeholder="length" value={packageAndDeliveryData.length} class="input" />
		</label>
		<label for="" class="form-control">
			<div>Width</div>
			<input type="number" placeholder="width" value={packageAndDeliveryData.width} class="input" />
		</label>
		<label for="" class="form-control">
			<div>Height</div>
			<input type="number" placeholder="height" value={packageAndDeliveryData.height} class="input" />
		</label>
	</div>
</div>

<style lang="postcss">
	input {
		@apply input-xs border-gray-200 w-full;
	}
</style>
