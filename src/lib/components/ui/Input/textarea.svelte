<script lang="ts">
	import { shortcuts } from '$lib/actions/shortcut';
	import Icon from '$lib/components/icons/icon.svelte';
	import { randomID } from '$lib/utils/utils';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { tClient } from '$i18n';
	import { TEXT_AREA_SIZE_MAP } from '$lib/utils/consts';
	import { INPUT_LABEL_SIZE_STYLE_MAP, INPUT_TYPES, type InputProps } from './input.types';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		label,
		id = randomID(),
		placeholder = tClient('product.valuePlaceholder'),
		variant = 'info',
		subText,
		startIcon,
		class: className = '',
		size = 'md',
		action,
		ref = $bindable<HTMLInputElement | HTMLTextAreaElement>(),
		inputDebounceOption,
		selectShortcutOptions = [],
		value = $bindable<string | number>(),
		required,
		inputClass = '',
		...rest
	}: InputProps & HTMLTextareaAttributes = $props();
</script>

<div class={`${className} ${rest.disabled ? 'text-gray-300! cursor-not-allowed!' : ''}`}>
	{#if label}
		<label
			for={id}
			class={`block mb-1.5 ${INPUT_LABEL_SIZE_STYLE_MAP[size]} font-medium ${INPUT_TYPES[variant].fg}`}
		>
			{label}
			{#if required}<strong class="font-bold text-red-600!">*</strong>{/if}
		</label>
	{/if}
	<div class={`${INPUT_TYPES[variant].fg}`}>
		<div class={`relative mt-0`}>
			{#if startIcon}
				<div class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
					<Icon icon={startIcon} />
				</div>
			{/if}

			<textarea
				bind:this={ref}
				{id}
				{placeholder}
				{required}
				bind:value
				use:shortcuts={selectShortcutOptions}
				use:debounceInput={inputDebounceOption}
				class={`w-full text-sm rounded-lg ring-1 focus:ring-2 outline-none! field-sizing-content inline-block px-2.5 py-1 ${inputClass} ${INPUT_TYPES[variant].bg} ${startIcon ? 'ps-8' : ''} ${TEXT_AREA_SIZE_MAP[size]}`}
				{...rest}
			></textarea>

			{#if action}
				<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action">
					{@render action()}
				</div>
			{/if}
		</div>
		{#if subText}
			<p class={`text-[10px] mt-0.5 text-right!`}>{subText}</p>
		{/if}
	</div>
</div>

<style>
	@import 'tailwindcss/theme';

	.input-action > * {
		@apply max-h-full max-w-full;
	}
</style>
