<script lang="ts">
	import { shortcuts } from '$lib/actions/shortcut';
	import Icon from '$lib/components/icons/icon.svelte';
	import { randomID } from '$lib/utils/utils';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { tranFunc } from '$i18n';
	import { INPUT_BUTTON_SIZE_MAP } from '$lib/components/ui/Button/button.types';
	import { INPUT_CLASSES, type InputProps } from './input.types';
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
		ref = $bindable<HTMLInputElement>(),
		inputDebounceOption,
		selectShortcutOptions = [],
		value = $bindable<string | number>(),
		required,
		inputClass = '',
		...rest
	}: InputProps = $props();
</script>

<div class={`${className} ${rest.disabled ? 'text-gray-300! cursor-not-allowed!' : ''}`}>
	{#if label}
		<Label {label} {id} {required} {size} {variant} requiredAtPos="end" />
	{/if}
	<div class={`relative mt-0 ${INPUT_CLASSES[variant].fg}`}>
		{#if startIcon}
			<div class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
				<Icon icon={startIcon} />
			</div>
		{/if}
		<input
			bind:this={ref}
			{id}
			{placeholder}
			{required}
			bind:value
			use:shortcuts={selectShortcutOptions}
			use:debounceInput={inputDebounceOption}
			class={`w-full text-sm rounded-lg placeholder:opacity-55 inline-block px-2 ${rest.disabled ? 'text-gray-400! cursor-not-allowed!' : ''} ${inputClass} ${INPUT_CLASSES[variant].bg} ${startIcon ? 'ps-8' : ''} ${action ? 'pe-9' : ''} ${INPUT_BUTTON_SIZE_MAP[size]}`}
			{...rest}
		/>

		{#if action}
			<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action">
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
