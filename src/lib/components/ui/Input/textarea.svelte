<script lang="ts">
	import { shortcuts } from '$lib/actions/shortcut';
	import Icon from '$lib/components/icons/icon.svelte';
	import { randomID } from '$lib/utils/utils';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { tranFunc } from '$i18n';
	import { TEXT_AREA_SIZE_MAP } from './input.types';
	import { INPUT_CLASSES, type InputProps } from './input.types';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import Label from './label.svelte';

	let {
		label,
		id = randomID(),
		placeholder = $tranFunc('placeholders.valuePlaceholder'),
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

<div class={`${className}`}>
	{#if label}
		<Label {label} {id} {required} {size} {variant} requiredAtPos="end" />
	{/if}
	<div class={`${INPUT_CLASSES[variant].fg}`}>
		<div class={`relative`}>
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
				class={[
					rest.disabled && 'text-gray-400! cursor-not-allowed!',
					'w-full text-sm placeholder:opacity-55 rounded-lg ring-1 focus:ring-2 outline-none! field-sizing-content inline-block px-2.5 py-1 transition-all hover:ring-2 ease-in-out duration-200',
					inputClass,
					INPUT_CLASSES[variant].bg,
					startIcon && 'ps-8',
					TEXT_AREA_SIZE_MAP[size],
				]}
				{...rest}
			></textarea>

			{#if action}
				<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action">
					{@render action()}
				</div>
			{/if}
		</div>
		{#if subText}
			<div class={`text-[10px] text-right!`}>{subText}</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.input-action > * {
		@apply max-h-full max-w-full;
	}
</style>
