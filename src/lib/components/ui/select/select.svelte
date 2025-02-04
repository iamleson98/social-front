<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon } from '$lib/components/icons';
	import { randomID } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	import { Input } from '../Input';
	import {
		SELECT_CLASSES,
		type SelectItemprops,
		type SelectOption,
		type SelectProps
	} from './types';

	let {
		options,
		value = $bindable<SelectOption['value'] | undefined>(),
		onchange,
		class: className = '',
		...rest
	}: SelectProps = $props();

	const ID = randomID();
	const INPUT_ID = `combobox-${ID}`;
	const LISTBOX_ID = `listbox-${ID}`;

	let searchQuery = $state('');
	let openSelect = $state(false);
	let selectedOption = $derived.by(() =>
		value ? options.find((opt) => opt.value === value) : undefined
	);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLElement[] = [];

	/** list of options that match search query */
	let filteredOptions = $derived.by(() =>
		searchQuery
			? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
			: options
	);

	const onInput = () => {
		toggleDropdown(true);
		searchQuery = input?.value.trim() ?? '';
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });
	};

	const deactivate = () => {
		searchQuery = '';
		toggleDropdown(false);
	};

	const activate = () => {
		searchQuery = '';
		toggleDropdown(true);
	};

	const handleFocus = (
		evt: FocusEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (rest.onfocus) rest.onfocus(evt);
		activate();
	};

	const toggleDropdown = (open: boolean) => (openSelect = open);

	const onClear = () => {
		input?.focus();
		value = undefined;
		searchQuery = '';
		onchange?.(undefined);
	};

	const handleSelect = (option: SelectOption) => {
		if (option.disabled) return; // disabled options cant be selected.

		value = option.value;
		toggleDropdown(false);
		onchange?.(option);
	};
</script>

<!-- this common snippet is used for rendering select options -->
{#snippet selectOption({ idx, disabled, optionClassName, onclick, value: _value, label }: SelectItemprops)}
	<li
		id={`${LISTBOX_ID}-${idx}`}
		aria-selected={_value === value}
		role="option"
		aria-disabled={disabled}
		class={`${optionClassName} ${SELECT_CLASSES.selectOption} ${_value === value ? SELECT_CLASSES.activeSelectOption : ''}`}
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
		{label}
	</li>
{/snippet}

{#snippet action()}
	{#if !!value}
		<span
			onclick={onClear}
			role="button"
			tabindex="0"
			onkeydown={(evt) => evt.key === 'Enter' && onClear()}
			class="cursor-pointer select-none!"
		>
			<Icon icon={CloseX} />
		</span>
	{:else if !openSelect}
		<Icon icon={ChevronSort} />
	{/if}
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
				toggleDropdown(false);
			}
		}
	]}
>
	<!-- please dont worry about 'onfocus' error warning, it still works -->
	<Input
		{...rest}
		aria-controls={LISTBOX_ID}
		aria-expanded={openSelect}
		bind:ref={input}
		aria-autocomplete="list"
		autocomplete="off"
		class={className}
		id={INPUT_ID}
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

	{#if openSelect}
		<ul
			role="listbox"
			id={LISTBOX_ID}
			transition:fly={{ duration: 250, y: 10 }}
			class={SELECT_CLASSES.selectMenu}
			tabindex="0"
		>
			{#if !filteredOptions.length}
				{@render selectOption({
					idx: 0,
					disabled: true,
					optionClassName: 'cursor-default',
					onclick: () => toggleDropdown(false),
					value: '',
					label: 'No data'
				})}
			{/if}
			{#each filteredOptions as option, idx (idx)}
				{@render selectOption({
					idx,
					optionClassName: `${option.disabled ? 'cursor-not-allowed! text-gray-400!' : ''}`,
					onclick: () => handleSelect(option),
					...option
				})}
			{/each}
		</ul>
	{/if}
</div>
