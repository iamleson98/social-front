<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: string;
		group?: unknown;
	} & Omit<HTMLInputAttributes, 'size'>;

	let {
		label,
		id = randomID(),
		group = $bindable<number | string | boolean>(),
		...rest
	}: Props = $props();
</script>

<div class="radio-btn-container">
	<input
		{id}
		type="radio"
		bind:group
		class="adio-btn-input bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
		{...rest}
	/>
	{#if label}
		<label for={id} class="radio-label">
			{label}
		</label>
	{/if}
</div>

<style lang="postcss">
	.radio-btn-container {
		@apply flex items-center gap-1.5 dark:border-gray-700 cursor-pointer;
	}
	.radio-btn-input {
		@apply w-4 h-4 text-blue-600;
	}
	.radio-label {
		@apply w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300;
	}
</style>
