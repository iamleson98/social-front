<script lang="ts">
	import type { HTMLInputTypeAttribute } from 'svelte/elements';
	import type { InputAutoComplete, InputVariant } from './types';

	export let value: any = '';
	export let type: HTMLInputTypeAttribute = 'text';
	export let element: HTMLElement | null = null;
	export let classes: string = '';
	export let id: string | null = null;
	export let placeholder: string = '';
	export let required: boolean = false;
	export let invalid: boolean = false;
	export let disabled: boolean = false;
	export let autocomplete: InputAutoComplete = 'on';
	export let variant: InputVariant = 'default';
	/**
	 * @param icon should have format "icon-[fa6-regular--envelop]" for tailwindcss to understand.
	 * @doc Please refer to https://icon-sets.iconify.design/fa6-regular/ for available font awesome icons.
	 */
	export let icon: string | null = null;
	export let tabindex: number | null = null;
	export let fullWidth: boolean = false;
</script>

<div
	class={`input-container ${classes} ${invalid ? 'input-invalid' : 'text-gray-500'} ${fullWidth ? 'w-full' : ''}`}
>
	{#if icon}
		<span class={`input-icon mr-2 ${icon}`}></span>
	{/if}
	<input
		{value}
		{type}
		{id}
		{placeholder}
		{required}
		{disabled}
		{autocomplete}
		{tabindex}
		aria-invalid={invalid}
		bind:this={element}
		class={`input input-${variant} `}
		class:has-action={$$slots.action}
		on:focus
		on:blur
		on:click
		on:mousedown
		on:change
		on:mouseup
		on:mouseenter
		on:mouseleave
		on:pointerenter
		on:pointerleave
		on:pointerdown
		on:pointerup
	/>
	{#if $$slots.action}
		<div class="flex items-center">
			<slot name="action" />
		</div>
	{/if}
</div>

<style lang="postcss">
	.input:disabled,
	input:disabled {
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		-khtml-user-select: none !important;
		-webkit-touch-callout: none !important;
		pointer-events: none !important;
		cursor: not-allowed !important;
	}
	.input {
		outline: none !important;
		@apply border-none h-8 leading-7 bg-transparent w-full text-sm overflow-hidden;
	}
	.input-invalid {
		@apply border-red-500 text-red-500 border;
	}

	/* .input-filled {
	}
	.input-default {
	} */
	.input-icon {
		color: inherit;
		font-size: inherit;
	}
	.input-container {
		@apply inline-flex flex-nowrap flex-row items-center rounded-lg bg-gray-100 px-1.5;
	}
	.has-action {
		@apply mr-2;
	}
</style>
