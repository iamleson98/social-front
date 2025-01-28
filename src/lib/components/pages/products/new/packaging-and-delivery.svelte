<script lang="ts">
	import { tranFunc } from '$i18n';
	import { MdiWeightKg } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import type { ProductInput } from '$lib/gql/graphql';

	type Props = {
		metadata: ProductInput['metadata'];
		weight: ProductInput['weight'];
	};

	let { metadata = $bindable([]), weight = $bindable() }: Props = $props();
</script>

{#snippet cm()}
	<span title="centimeter" class="text-sm font-semibold text-gray-700">cm</span>
{/snippet}

<div class="mb-3">
	<span class="text-sm">{$tranFunc('common.packaging')}</span>
	<div class="flex items-center text-xs gap-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
		<div class="w-3/12">
			<div>{$tranFunc('product.weight')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.weight')}
				bind:value={weight}
				startIcon={MdiWeightKg}
				size="sm"
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.length')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.length')}
				bind:value={metadata![0].value}
				size="sm"
				action={cm}
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.width')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.width')}
				bind:value={metadata![1].value}
				size="sm"
				action={cm}
			/>
		</div>
		<div class="w-1/3">
			<div>{$tranFunc('product.height')}</div>
			<Input
				type="number"
				placeholder={$tranFunc('product.height')}
				bind:value={metadata![2].value}
				size="sm"
				action={cm}
			/>
		</div>
	</div>
</div>
