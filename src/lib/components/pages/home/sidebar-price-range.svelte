<script lang="ts">
	import { tClient } from '$i18n';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { CurrencyIconMap, type Currency } from '$lib/utils/consts';

	type Props = {
		onChange: (from: number, to: number) => void;
		currency: Currency;
	};

	let { currency, onChange }: Props = $props();

	type RangeState = {
		from: number;
		to: number;
	};

	let rangeValue = $state<RangeState>({ from: 0, to: 1 });
	let error = $derived.by(() => {
		if (rangeValue.from < 0 || rangeValue.to < 0) return tClient('error.negativeNumber');
		if (rangeValue.from >= rangeValue.to) return tClient('error.startGreaterEnd');
		return null;
	});

	$effect(() => {
		if ($effect.tracking()) onChange(rangeValue.from, rangeValue.to);
	});
</script>

<Accordion header="Price Range" fixed>
	<div class="flex items-center gap-2 justify-between">
		<Input
			placeholder="from"
			type="number"
			min={0}
			size="sm"
			bind:value={rangeValue.from}
			startIcon={CurrencyIconMap[currency]}
			variant={error ? 'error' : 'normal'}
		/>
		<Input
			placeholder="to"
			type="number"
			min={0}
			size="sm"
			startIcon={CurrencyIconMap[currency]}
			variant={error ? 'error' : 'normal'}
			bind:value={rangeValue.to}
		/>
	</div>
	{#if error}
		<Alert class="mt-2" variant="error" size="xs" bordered>
			{error}
		</Alert>
	{/if}
</Accordion>
