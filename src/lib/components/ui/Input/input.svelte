<script lang="ts" context="module">
	export type Props = {
		label?: string;
		variant?: 'normal' | 'error' | 'success';
		subText?: string;
		startIcon?: IconType;
		size?: 'sm' | 'md' | 'lg';
		action?: Snippet; /** a component to the end of  */
	} & Omit<HTMLInputAttributes, 'size'>;
</script>

<script lang="ts">
	import type { IconType } from '$lib/components/icons';
	import Icon from '$lib/components/icons/icon.svelte';
	import { randomID } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label,
		id = randomID(),
		placeholder,
		variant = 'normal',
		subText,
		startIcon,
		class: className = '',
		type = 'text',
		size = 'md',
		action,
		value = $bindable(),
		...rest
	}: Props = $props();
</script>

{#if label}
	<label for={id} class={`block mb-1.5 text-sm font-medium input-${variant}`}>
		{label}
	</label>
{/if}
<div class={`relative ${className} input-${variant}`}>
	{#if startIcon}
		<div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
			<Icon icon={startIcon} />
		</div>
	{/if}
	<input
		{type}
		{placeholder}
		{id}
		bind:value
		class={`border text-sm rounded-lg w-full block p-2.5 input-bg-${variant} ${startIcon ? 'ps-10' : ''} input-${size}`}
		{...rest}
	/>
	{#if action}
		<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action">
			{@render action()}
		</div>
	{/if}
</div>
{#if subText}
	<p class={`text-[10px] input-${variant} mt-0.5`}>{subText}</p>
{/if}

<style lang="postcss">
	.input-normal {
		@apply text-gray-800 dark:text-white;
	}
	.input-error {
		@apply text-red-600;
	}
	.input-success {
		@apply text-green-600;
	}
	.input-bg-normal {
		@apply bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
	}
	.input-bg-success {
		@apply bg-green-50 border-green-300 text-green-700 placeholder-green-600 focus:ring-green-500 focus:border-green-500 dark:bg-green-700 dark:border-green-600 dark:placeholder-green-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500;
	}
	.input-bg-error {
		@apply bg-red-50 border-red-300 text-red-700 placeholder-red-600 focus:ring-red-500 focus:border-red-500 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500;
	}
	.input-lg {
		@apply py-4 text-base;
	}
	.input-sm {
		@apply py-1.5 text-xs;
	}
	.input-md {
		@apply text-sm;
	}
	.input-action > * {
		@apply max-h-full max-w-full
	}
</style>
