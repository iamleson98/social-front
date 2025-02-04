<script lang="ts">
	import { tranFunc } from '$i18n';
	import { MdiWeightKg } from '$lib/components/icons';
	import { RequiredAt } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { ProductInput } from '$lib/gql/graphql';

	type Props = {
		metadata: ProductInput['metadata'];
		weight: ProductInput['weight'];
	};

	let { metadata = $bindable([]), weight = $bindable() }: Props = $props();

	const handleMetaChange = (index: number, value: string) => {
		metadata = metadata!.map((item, i) => {
			if (i === index) {
				return { ...item, value };
			} else {
				return item;
			}
		});
	};
</script>

{#snippet cm()}
	<span title="centimeter" class="text-sm font-semibold text-gray-700">cm</span>
{/snippet}

<div class="mb-3">
	<RequiredAt class="text-sm" label={$tranFunc('common.packaging')} required />

	<div class="flex items-center text-xs gap-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
		<div class="w-3/12">
			<div>{$tranFunc('product.weight')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.weight')}
				bind:value={weight}
				startIcon={MdiWeightKg}
				size="sm"
				min="0"
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.length')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.length')}
				onchange={(evt) => handleMetaChange(0, evt.currentTarget.value.trim())}
				size="sm"
				action={cm}
				min="0"
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.width')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.width')}
				onchange={(evt) => handleMetaChange(1, evt.currentTarget.value.trim())}
				size="sm"
				action={cm}
				min="0"
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.height')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.height')}
				onchange={(evt) => handleMetaChange(2, evt.currentTarget.value.trim())}
				size="sm"
				action={cm}
				min="0"
			/>
		</div>
	</div>
</div>
