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
		type MultiSelectProps
	} from './types';
	import { Badge } from '../badge';
	import type { FocusEventHandler } from 'svelte/elements';

	let {
		value = $bindable<Array<SelectOption>>([]),
		class: className = '',
		...rest
	}: MultiSelectProps = $props();

	const ID = randomID();
	const INPUT_ID = `combobox-${ID}`;
	const LISTBOX_ID = `listbox-${ID}`;

	let searchQuery = $state('');
	let openSelect = $state(false);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLElement[] = [];

	/** hide away selected options */
	let displayOptions = $state.raw(rest.options);

	/** list of options that match search query */
	let searchFilteredOptions = $derived.by(() =>
		searchQuery
			? displayOptions.filter((option) =>
					option.label.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: displayOptions
	);

	const onInput = () => {
		toggleDropdown(true);
		searchQuery = input?.value.trim() ?? '';
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });
	};

	const interactOutsideHandler = () => {
		searchQuery = '';
		toggleDropdown(false);
	};

	const handleClick = () => {
		searchQuery = '';
		toggleDropdown(true);
	};

	const handleFocus: FocusEventHandler<HTMLInputElement> = (evt) => {
		if (rest.onfocus) rest.onfocus(evt);
		handleClick();
	};

	const toggleDropdown = (open: boolean) => (openSelect = open);

	const onClear = () => {
		input?.focus();
		searchQuery = '';
	};

	const handleSelect = (option: SelectOption) => {
		value = [...value, option];
		displayOptions = displayOptions.filter((opt) => opt.value !== option.value);
		toggleDropdown(false);
    searchQuery = '';
	};

	const handleDeselectOption = (option: SelectOption) => {
		value = value.filter((opt) => opt.value !== option.value);
		displayOptions = [...displayOptions, option];
	};
</script>

<!-- this common snippet is used for rendering select options -->
{#snippet selectOption({ idx, disabled, optionClassName, onclick, option }: SelectItemprops)}
	<li
		id={`${LISTBOX_ID}-${idx}`}
		aria-selected={false}
		role="option"
		aria-disabled={disabled}
		class={`${optionClassName} ${SELECT_CLASSES.selectOption}`}
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

{#snippet action()}
	{#if !!searchQuery}
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

<div
	class="relative text-gray-700 text-base bg-white rounded-lg w-fit py-1 px-1.5 ring-1 ring-gray-200"
	use:clickOutside={{ onOutclick: interactOutsideHandler }}
	use:focusOutside={{ onFocusOut: interactOutsideHandler }}
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
	<div class="flex flex-wrap items-center gap-1 flex-1">
		{#each value as option, idx (idx)}
			<Badge
				text={`${option.label}`}
				variant="light"
				size="sm"
				onDismiss={() => handleDeselectOption(option)}
			/>
		{/each}
		<Input
			{...rest}
			aria-controls={LISTBOX_ID}
			aria-expanded={openSelect}
			bind:ref={input}
			aria-autocomplete="list"
			autocomplete="off"
			class={`${className} grow shrink basis-[min-content]`}
      inputClass="ring-0!"
			id={INPUT_ID}
			size="xs"
			onclick={handleClick}
			onfocus={handleFocus}
			value={searchQuery}
			type="text"
			role="combobox"
			inputDebounceOption={{
				onInput
			}}
			{action}
		/>
	</div>

	{#if openSelect}
		<ul
			role="listbox"
			id={LISTBOX_ID}
			transition:fly={{ duration: 250, y: 10 }}
			class={SELECT_CLASSES.selectMenu}
			tabindex="0"
		>
			{#if !searchFilteredOptions.length}
				{@render selectOption({
					idx: 0,
					disabled: true,
					optionClassName: 'cursor-default',
					onclick: () => toggleDropdown(false),
					option: { value: 'No data', label: 'No data' }
				})}
			{/if}
			{#each searchFilteredOptions as option, idx (idx)}
				{@render selectOption({
					idx,
					disabled: false,
					optionClassName: 'cursor-pointer transition-all',
					onclick: () => handleSelect(option),
					option
				})}
			{/each}
		</ul>
	{/if}
</div>
