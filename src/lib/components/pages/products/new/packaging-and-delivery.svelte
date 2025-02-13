<script lang="ts">
	import { tranFunc } from '$i18n';
	import { MdiWeightKg } from '$lib/components/icons';
	import { Input, Label } from '$lib/components/ui/Input';
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
	<Label required requiredAtPos="end" label={$tranFunc('common.packaging')} />

	<div class="flex items-start text-xs gap-2 rounded-lg bg-gray-50 border border-gray-200 p-3">
		<Input
			type="number"
			placeholder={$tranFunc('product.weight')}
			label={$tranFunc('product.weight')}
			bind:value={weight}
			startIcon={MdiWeightKg}
			size="sm"
			min="0"
			class="w-1/4 tablet:w-1/2 mobile-l:w-full"
		/>
		<Input
			type="number"
			placeholder={$tranFunc('product.length')}
			label={$tranFunc('product.length')}
			onchange={(evt) => handleMetaChange(0, evt.currentTarget.value.trim())}
			size="sm"
			action={cm}
			min="0"
			class="w-1/4 tablet:w-1/2 mobile-l:w-full"
		/>
		<Input
			type="number"
			placeholder={$tranFunc('product.width')}
			label={$tranFunc('product.width')}
			onchange={(evt) => handleMetaChange(1, evt.currentTarget.value.trim())}
			size="sm"
			action={cm}
			min="0"
			class="w-1/4 tablet:w-1/2 mobile-l:w-full"
		/>
		<Input
			type="number"
			placeholder={$tranFunc('product.height')}
			label={$tranFunc('product.height')}
			onchange={(evt) => handleMetaChange(2, evt.currentTarget.value.trim())}
			size="sm"
			action={cm}
			min="0"
			class="w-1/4 tablet:w-1/2 mobile-l:w-full"
		/>
	</div>
</div>
