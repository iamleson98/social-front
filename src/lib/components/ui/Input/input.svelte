<script module lang="ts">
	export type Props = {
		label?: string;
		variant?: SocialVariant;
		subText?: string;
		startIcon?: IconType;
		size?: SocialSize;
		/** a component to the end of input */
		action?: Snippet;
		ref?: HTMLInputElement | HTMLTextAreaElement;

		/** indicate if this component is being used in as <Select /> component */
		selectShortcutOptions?: ShortcutOptions<HTMLInputElement | HTMLTextAreaElement>[];
		inputDebounceOption?: InputDebounceOpts;
	} & Omit<HTMLInputAttributes, 'size'>;
</script>

<script lang="ts">
	import { shortcuts, type ShortcutOptions } from '$lib/actions/shortcut';
	import type { IconType } from '$lib/components/icons';
	import Icon from '$lib/components/icons/icon.svelte';
	import { randomID } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '../common';
	import { debounceInput, type InputDebounceOpts } from '$lib/actions/input-debounce';
	import type { SocialVariant } from '$lib/utils';
	import { tClient } from '$i18n';
	import { SIZE_MAP } from '$lib/utils/consts';

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
		ref = $bindable<HTMLInputElement>(),
		inputDebounceOption,
		selectShortcutOptions = [],
		value = $bindable<string | number>(),
		required,
		...rest
	}: Props = $props();

	const labelSizeMapping = {
		xs: 'text-[10px]',
		sm: 'text-xs',
		md: 'text-base',
		lg: 'text-lg',
		xl: 'text-xl'
	};
</script>

{#if label}
	<label for={id} class={`block mb-1.5 ${labelSizeMapping[size]} font-medium input-${variant}`}>
		{label}
		{#if required}<strong class="font-bold !text-red-600">*</strong>{/if}
	</label>
{/if}
<div class={`${className} input-${variant}`}>
	<div class={`relative mt-0`}>
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
			class={`border w-full text-sm rounded-lg block px-2.5 input-bg-${variant} ${startIcon ? 'ps-8' : ''} ${SIZE_MAP[size]}`}
			{...rest}
		/>

		{#if action}
			<div class="absolute end-2 top-1/2 transform -translate-y-1/2 input-action">
				{@render action()}
			</div>
		{/if}
	</div>
	{#if subText}
		<p class={`text-[10px] mt-0.5 !text-right`}>{subText}</p>
	{/if}
</div>

<style lang="postcss">
	.input-info {
		@apply !text-gray-800 dark:text-white;
	}
	.input-error {
		@apply !text-red-600;
	}
	.input-success {
		@apply !text-green-600;
	}
	.input-bg-info {
		@apply bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
	}
	.input-bg-success {
		@apply bg-green-50 border-green-300 text-green-700 placeholder-green-600 focus:ring-green-500 focus:border-green-500 dark:bg-green-700 dark:border-green-600 dark:placeholder-green-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500;
	}
	.input-bg-error {
		@apply bg-red-50 border-red-300 text-red-700 placeholder-red-600 focus:ring-red-500 focus:border-red-500 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500;
	}
	.input-action > * {
		@apply max-h-full max-w-full;
	}
</style>
