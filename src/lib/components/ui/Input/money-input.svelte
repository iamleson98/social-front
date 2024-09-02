<script lang="ts">
	import { CurrencyIconMap, type Currency } from '$lib/utils/consts';
	import Input, { type Props as InputProps } from './input.svelte';

	type Props = Omit<InputProps, 'startIcon' | 'action'> & {
		currency: Currency;
	};

	let { currency, placeholder, value = $bindable(), ...rest }: Props = $props();

	let displayValue = $state('');
	// let displayValue = $state(() => {
	// 	return realValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	// });
</script>

<Input
	startIcon={CurrencyIconMap[currency]}
	{placeholder}
	bind:value={displayValue}
	type="text"
	{...rest}
/>
