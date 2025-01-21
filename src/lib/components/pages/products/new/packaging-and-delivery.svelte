<script lang="ts">
	import { tClient } from '$i18n';
	import { Input } from '$lib/components/ui/Input';

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

<div class="mb-3">
	<span class="text-sm">{tClient('common.packaging')}</span>
	<div class="flex items-center text-xs gap-1 rounded-lg bg-gray-50 border border-gray-200 p-3">
		<div class="w-3/12">
			<div>{tClient('product.weight')}</div>
			<Input type="number" placeholder="weight" bind:value={packageAndDeliveryData.weight} />
		</div>
		<div class="w-3/12">
			<div>{tClient('product.length')}</div>
			<Input type="number" placeholder="length" bind:value={packageAndDeliveryData.length} />
		</div>
		<div class="w-3/12">
			<div>{tClient('product.width')}</div>
			<Input type="number" placeholder="width" bind:value={packageAndDeliveryData.width} />
		</div>
		<div class="w-3/12">
			<div>{tClient('product.height')}</div>
			<Input type="number" placeholder="height" bind:value={packageAndDeliveryData.height} />
		</div>
	</div>
</div>
