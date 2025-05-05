<script lang="ts">
	import { DEBOUNCE_INPUT_TIME } from '$lib/utils/consts';
	import Input from './input.svelte';
	import type { InputDebounceProps } from './input.types';

	let {
		debounceTime = DEBOUNCE_INPUT_TIME,
		value = $bindable(),
		...rest
	}: InputDebounceProps = $props();
</script>

<Input
	{...rest}
	{value}
	inputDebounceOption={{
		debounceTime,
		onInput: (evt) => (value = (evt.target as HTMLInputElement).value)
	}}
/>
