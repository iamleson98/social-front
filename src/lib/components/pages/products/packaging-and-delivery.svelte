<script lang="ts">
	import { Input } from "$lib/components/ui/Input";

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
		<Input type="number" placeholder="weight" value={packageAndDeliveryData.weight} />
	</label>
	<div class="flex items-center gap-1">
		<label for="" class="form-control">
			<div>Length</div>
			<Input type="number" placeholder="length" value={packageAndDeliveryData.length} />
		</label>
		<label for="" class="form-control">
			<div>Width</div>
			<Input type="number" placeholder="width" value={packageAndDeliveryData.width} />
		</label>
		<label for="" class="form-control">
			<div>Height</div>
			<Input type="number" placeholder="height" value={packageAndDeliveryData.height} />
		</label>
	</div>
</div>

