<script lang="ts">
	import { shortcuts } from '$lib/actions/shortcut';
	import Icon from '$lib/components/icons/icon.svelte';
	import { classNames, randomID } from '$lib/utils/utils';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { INPUT_BUTTON_SIZE_MAP } from '$lib/components/ui/Button/button.types';
	import { INPUT_CLASSES, type InputProps } from './input.types';
	import Label from './label.svelte';

	let {
		label,
		id = randomID(),
		variant = 'info',
		subText,
		startIcon,
		class: className = '',
		size = 'md',
		action,
		ref = $bindable<HTMLInputElement>(),
		inputDebounceOption,
		selectShortcutOptions = [],
		value = $bindable<string | number>(),
		required,
		inputClass = '',
		placeholder = 'provide value',
		...rest
	}: InputProps = $props();
</script>

<div
	class={classNames(className as string, {
		'text-gray-300! cursor-not-allowed!': !!rest.disabled,
	})}
>
	{#if label}
		<Label {label} {id} {required} {size} {variant} requiredAtPos="end" />
	{/if}
	<div class={`relative flex items-center ${INPUT_CLASSES[variant].fg}`}>
		{#if startIcon}
			<div class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
				<Icon icon={startIcon} {size} />
			</div>
		{/if}
		<input
			bind:this={ref}
			{id}
			{required}
			{placeholder}
			bind:value
			use:shortcuts={selectShortcutOptions}
			use:debounceInput={inputDebounceOption}
			class={classNames(
				'w-full text-sm rounded-lg placeholder:opacity-55 inline-block px-2 transition-all duration-200 ease-in-out hover:ring-2 focus:ring-2 ring-1',
				inputClass,
				INPUT_BUTTON_SIZE_MAP[size],
				INPUT_CLASSES[variant].bg,
				{
					'text-gray-400! cursor-not-allowed!': !!rest.disabled,
					'ps-8': !!startIcon,
					'pe-9': !!action,
				},
			)}
			{...rest}
		/>

		{#if action}
			<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action flex items-center">
				{@render action()}
			</div>
		{/if}
	</div>
	{#if subText}
		<div class={`text-[10px] mt-0.5 text-right! ${INPUT_CLASSES[variant].fg}`}>{subText}</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.input-action > * {
		@apply max-h-full max-w-full;
	}
</style>
