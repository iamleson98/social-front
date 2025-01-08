<script lang="ts" module>
	export type SelectOption = {
		value: string;
		label: string;
	};
</script>

<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon } from '$lib/components/icons';
	import { classNames, randomID } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	import { Input, type InputProps } from '../Input';

	type SnippetProps = {
		/** default `false` */
		disabled: boolean;
		idx: number;
		option: SelectOption;
		className: string;
		onclick?: () => void;
	};

	type Props = {
		options: SelectOption[];
		class?: string;
	} & InputProps;

	let {
		options,
		value = $bindable<string | number | undefined>(),
		class: className = '',
		...rest
	}: Props = $props();

	let searchQuery = $state('');
	let searchFocus = $state(false);
	let openSelect = $state(false);
	let selectedOption = $derived.by(() =>
		value ? options.find((opt) => opt.value === value) : undefined
	);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLElement[] = [];
	const id = randomID();

	/** list of options that match search query */
	let filteredOptions = $derived.by(() =>
		searchQuery
			? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
			: options
	);

	const inputId = `combobox-${id}`;
	const listboxId = `listbox-${id}`;

	const onInput = () => {
		openDropdown();
		searchQuery = input?.value.trim() ?? '';
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });
	};

	const deactivate = () => {
		searchQuery = '';
		searchFocus = false;
		closeDropdown();
	};

	const activate = () => {
		searchFocus = true;
		searchQuery = '';
		openDropdown();
	};

	const handleFocus = (
		evt: FocusEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (rest.onfocus) rest.onfocus(evt);
		activate();
	};

	const openDropdown = () => {
		openSelect = true;
	};

	const closeDropdown = () => {
		openSelect = false;
	};

	const onClear = () => {
		input?.focus();
		value = '';
		searchQuery = '';
	};

	const handleSelect = (option: SelectOption) => {
		value = option.value;
		closeDropdown();
	};
</script>

<!-- this common snippet is used for rendering select options -->
{#snippet selectOption({ idx, disabled, className, onclick, option }: SnippetProps)}
	<li
		id={`${listboxId}-${idx}`}
		aria-selected={option.value === value}
		role="option"
		aria-disabled={disabled}
		class={`${className} select-option ${option.value === value ? 'active-select-option' : ''}`}
		bind:this={optionRefs[idx]}
		{onclick}
		onkeydown={(e) => e.key === 'Enter' && onclick?.()}
		tabindex="0"
		use:shortcuts={[
			{
				shortcut: { key: 'Enter' },
				onShortcut: () => onclick?.()
			}
		]}
	>
		{option.label}
	</li>
{/snippet}

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
		<Input
			{...rest}
			aria-controls={listboxId}
			aria-expanded={openSelect}
			bind:ref={input}
			aria-autocomplete="list"
			autocomplete="off"
			class={classNames({
				[className]: true,
				'rounded-b-none!': openSelect,
				'cursor-pointer': !searchFocus
			})}
			id={inputId}
			onclick={activate}
			onfocus={handleFocus}
			value={selectedOption?.label}
			type="text"
			role="combobox"
			inputDebounceOption={{
				onInput
			}}
			{action}
		/>

		{#snippet action()}
			{#if !!value}
				<span
					onclick={onClear}
					role="button"
					tabindex="0"
					onkeydown={(evt) => evt.key === 'Enter' && onClear()}
					class="cursor-pointer"
				>
					<Icon icon={CloseX} />
				</span>
			{:else if !openSelect}
				<Icon icon={ChevronSort} />
			{/if}
		{/snippet}
	</div>

	{#if openSelect}
		<ul
			role="listbox"
			id={listboxId}
			transition:fly={{ duration: 250 }}
			class="select-menu"
			tabindex="0"
		>
			{#if !filteredOptions.length}
				{@render selectOption({
					idx: 0,
					disabled: true,
					className: 'cursor-default',
					onclick: closeDropdown,
					option: { value: 'No results found', label: 'No results found' }
				})}
			{/if}
			{#each filteredOptions as option, idx (idx)}
				{@render selectOption({
					idx,
					disabled: false,
					className: 'cursor-pointer transition-all',
					onclick: () => handleSelect(option),
					option
				})}
			{/each}
		</ul>
	{/if}
</div>

<style>
	@import "tailwindcss/theme";

	.select-menu {
		@apply absolute text-left mt-0.5 text-sm w-full max-h-64 overflow-y-auto bg-white rounded-md z-100000000000000000 shadow-sm border border-gray-200;
	}
	.select-option {
		@apply text-left w-full px-4 py-1 hover:bg-blue-50 aria-selected:bg-blue-50 hover:text-blue-600;
	}
	.active-select-option {
		@apply bg-blue-50 text-blue-600;
	}
</style>
