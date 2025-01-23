<script lang="ts">
	import { CurrencyIconMap, type CurrencyCode } from '$lib/utils/consts';
	import Input from './input.svelte';
	import type { InputProps } from './input.types';

	type Props = Omit<InputProps, 'startIcon' | 'action'> & {
		currency: CurrencyCode;
	};

	let { currency, placeholder, value = $bindable(), ...rest }: Props = $props();

	let displayValue = $state('');
</script>

<Input
	startIcon={CurrencyIconMap[currency]}
	{placeholder}
	bind:value={displayValue}
	type="text"
	{...rest}
/>
