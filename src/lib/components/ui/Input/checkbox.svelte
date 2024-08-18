<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: string;
	} & HTMLInputAttributes;

	let {
		label,
		checked = $bindable(),
		name,
		id = randomID(),
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class={`flex items-center ${className}`}>
	<input {...rest} bind:checked type="checkbox" {name} {id} class="input-checkbox" />
	{#if label}
		<label for={id} class="checkbox-label">{label}</label>
	{/if}
</div>

<style lang="postcss">
	.input-checkbox {
		@apply w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
	}
	.checkbox-label {
		@apply ms-2 text-xs text-gray-600 dark:text-gray-300 select-none;
	}
</style>
