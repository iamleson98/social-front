<script lang="ts">
	import { T } from '$i18n';
	import { MdiWeightKg } from '$lib/components/icons';
	import { Input, Label } from '$lib/components/ui/Input';
	import type { ProductInput } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { type Snippet } from 'svelte';

	type Props = {
		metadata: ProductInput['metadata'];
		weight: ProductInput['weight'];
		loading: boolean;
	};

	let { metadata = $bindable([]), weight = $bindable(), loading }: Props = $props();

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

<div class={SitenameCommonClassName}>
	<Label required requiredAtPos="end" label={$T('common.packaging')} />

	<div class="flex items-start gap-2">
		<Input
			type="number"
			placeholder={$T('attributes.Weight')}
			label={$T('attributes.Weight')}
			bind:value={weight}
			startIcon={MdiWeightKg}
			size="sm"
			min="0"
			class="w-1/4 max-tablet:w-1/2 max-mobile-l:w-full"
			disabled={loading}
		/>
		<Input
			type="number"
			placeholder={$T('product.length')}
			label={$T('product.length')}
			value={metadata?.[0]?.value}
			onchange={(evt) => handleMetaChange(0, evt.currentTarget.value.trim())}
			size="sm"
			action={cm as Snippet<[]>}
			min="0"
			class="w-1/4 max-tablet:w-1/2 max-mobile-l:w-full"
			disabled={loading}
		/>
		<Input
			type="number"
			placeholder={$T('product.width')}
			label={$T('product.width')}
			value={metadata?.[1]?.value}
			onchange={(evt) => handleMetaChange(1, evt.currentTarget.value.trim())}
			size="sm"
			action={cm as Snippet<[]>}
			min="0"
			class="w-1/4 max-tablet:w-1/2 max-mobile-l:w-full"
			disabled={loading}
		/>
		<Input
			type="number"
			placeholder={$T('product.height')}
			label={$T('product.height')}
			value={metadata?.[2]?.value}
			onchange={(evt) => handleMetaChange(2, evt.currentTarget.value.trim())}
			size="sm"
			action={cm as Snippet<[]>}
			min="0"
			class="w-1/4 max-tablet:w-1/2 max-mobile-l:w-full"
			disabled={loading}
		/>
	</div>
</div>
