<script lang="ts" context="module">
	export type SelectOption = {
		value: string;
		label: string;
	};
</script>

<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { debounceInput } from '$lib/actions/input-debounce';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon, Search } from '$lib/components/icons';
	import { randomID } from '$lib/utils/utils';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';

	type SnippetProps = {
		/** default `false` */
		disabled: boolean;
		idx: number;
		value: string;
		className: string;
		onclick?: () => void;
	};

	type Props = {
		options: SelectOption[];
		/** placeholder value */
		placeholder?: string;
		label?: string;
		selectedOption?: SelectOption;
		onSelect?: (option?: SelectOption) => void;
		/** default `false` */
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'normal' | 'error' | 'success';
	};

	let {
		options,
		placeholder = 'Enter a value',
		label,
		selectedOption,
		onSelect,
		disabled = false,
		size = 'md',
		variant = 'normal',
	}: Props = $props();

	let searchQuery = $state(selectedOption?.label || '');
	let searchFocus = $state(false);
	let openSelect = $state(false);
	let selectedIndex = $state<number | undefined>(undefined);
	let input: HTMLInputElement;
	let optionRefs: HTMLElement[] = [];
	const id = randomID();

	/** list of options that match search query */
	let filteredOptions = $derived(
		options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	const inputId = `combobox-${id}`;
	const listboxId = `listbox-${id}`;

	const onInput = () => {
		openDropdown();
		searchQuery = input.value.trim();
		selectedIndex = undefined;
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });
	};

	const deactivate = () => {
		searchQuery = selectedOption?.label || '';
		searchFocus = false;
		closeDropdown();
	};

	const activate = () => {
		searchFocus = true;
		searchQuery = '';
		openDropdown();
	};

	const openDropdown = () => {
		openSelect = true;
	};

	const closeDropdown = () => {
		openSelect = false;
		selectedIndex = undefined;
	};

	const onClear = () => {
		input?.focus();
		selectedIndex = undefined;
		selectedOption = undefined;
		searchQuery = '';
		onSelect?.(selectedOption);
	};

	const handleSelect = (option: SelectOption) => {
		selectedOption = option;
		searchQuery = option.label;
		onSelect?.(option);
		closeDropdown();
	};

	const incrementSelectedIndex = async (delta: number) => {
		if (!filteredOptions.length) {
			selectedIndex = 0;
		} else if (selectedIndex === undefined) {
			selectedIndex = delta === 1 ? 0 : filteredOptions.length - 1;
		} else {
			selectedIndex = (selectedIndex + delta + filteredOptions.length) % filteredOptions.length;
		}
		await tick();
		optionRefs[selectedIndex]?.scrollIntoView({ block: 'nearest' });
	};
</script>

<!-- this common snippet is used for rendering select options -->
{#snippet selectOption({ idx, disabled, className, onclick, value }: SnippetProps)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<li
		id={`${listboxId}-${idx}`}
		aria-selected={selectedIndex === idx}
		role="option"
		aria-disabled={disabled}
		class={`${className} text-left w-full px-4 py-2 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600`}
		bind:this={optionRefs[idx]}
		{onclick}
	>
		{value}
	</li>
{/snippet}

{#if label}
	<label for={inputId}>{label}</label>
{/if}

<div
	class="relative w-full text-gray-700 text-base"
	use:clickOutside={{ onOutclick: deactivate }}
	use:focusOutside={{ onFocusOut: deactivate }}
	use:shortcuts={[
		{
			shortcut: { key: 'Escape' },
			onShortcut: (event) => {
				event.stopPropagation();
				closeDropdown();
			}
		}
	]}
>
	<div>
		{#if searchFocus}
			<div class="absolute inset-y-0 left-0 flex items-center pl-3">
				<div class="text-gray-500">
					<Icon icon={Search} aria-hidden={true} />
				</div>
			</div>
		{/if}

		<input
			{placeholder}
			{disabled}
			aria-activedescendant={selectedIndex || selectedIndex === 0
				? `${listboxId}-${selectedIndex}`
				: ''}
			aria-controls={listboxId}
			aria-expanded={openSelect}
			bind:this={input}
			aria-autocomplete="list"
			autocomplete="off"
			class:!pl-8={searchFocus}
			class:!rounded-b-none={openSelect}
			class:cursor-pointer={!searchFocus}
			class={`border text-sm rounded-lg w-full block p-2.5 input-bg-${variant} input-${size}`}
			id={inputId}
			onclick={activate}
			onfocus={activate}
			bind:value={searchQuery}
			type="text"
			role="combobox"
			use:debounceInput={{
				onInput
			}}
			use:shortcuts={[
				{
					shortcut: { key: 'ArrowUp' },
					onShortcut: () => {
						openDropdown();
						incrementSelectedIndex(-1);
					}
				},
				{
					shortcut: { key: 'ArrowDown' },
					onShortcut: () => {
						openDropdown();
						incrementSelectedIndex(1);
					}
				},
				{
					shortcut: { key: 'ArrowDown', alt: true },
					onShortcut: () => {
						openDropdown();
					}
				},
				{
					shortcut: { key: 'Enter' },
					onShortcut: () => {
						if (selectedIndex !== undefined && filteredOptions.length > 0) {
							handleSelect(filteredOptions[selectedIndex]);
						}
						closeDropdown();
					}
				},
				{
					shortcut: { key: 'Escape' },
					onShortcut: (event) => {
						event.stopPropagation();
						closeDropdown();
					}
				}
			]}
		/>

		<div
			class="absolute right-0 top-0 h-full flex px-4 justify-center content-between items-center"
			class:pr-2={selectedOption}
			class:pointer-events-none={!selectedOption}
		>
			{#if selectedOption}
				<button class="btn btn-circle btn-xs" onclick={onClear} title="Clear value">
					<Icon icon={CloseX} />
				</button>
			{:else if !openSelect}
				<Icon icon={ChevronSort} aria-hidden={true} />
			{/if}
		</div>
	</div>

	{#if openSelect}
		<ul
			role="listbox"
			id={listboxId}
			transition:fly={{ duration: 250 }}
			class="absolute text-left text-sm w-full max-h-64 overflow-y-auto bg-white rounded-b-xl z-10 shadow-sm border border-gray-200"
			tabindex="-1"
		>
			{#if filteredOptions.length === 0}
				{@render selectOption({
					idx: 0,
					disabled: true,
					className: 'cursor-default',
					onclick: closeDropdown,
					value: 'No results found'
				})}
			{/if}
			{#each filteredOptions as option, idx (idx)}
				{@render selectOption({
					idx,
					disabled: false,
					className: 'cursor-pointer transition-all',
					onclick: () => handleSelect(option),
					value: option.label
				})}
			{/each}
		</ul>
	{/if}
</div>

<style lang="postcss">
	.input-normal {
		@apply !text-gray-800 dark:text-white;
	}
	.input-error {
		@apply !text-red-600;
	}
	.input-success {
		@apply !text-green-600;
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
		@apply max-h-full max-w-full;
	}
</style>
