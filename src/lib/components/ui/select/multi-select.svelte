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
		type MultiSelectProps,
		SIZE_REDUCE_MAP
	} from './types';
	import { Badge } from '../badge';
	import type { FocusEventHandler } from 'svelte/elements';
	import { INPUT_LABEL_SIZE_STYLE_MAP, INPUT_TYPES } from '../Input/input.types';

	let {
		value = $bindable<SelectOption[]>([]),
		class: className = '',
		maxDisplay,
		size = 'md',
		label,
		variant = 'info',
		...rest
	}: MultiSelectProps = $props();

	if (typeof maxDisplay === 'number' && maxDisplay <= 0) throw new Error('maxDisplay must be > 0');

	const ID = randomID();
	const INPUT_ID = `combobox-${ID}`;
	const LISTBOX_ID = `listbox-${ID}`;

	let searchQuery = $state('');
	let openSelect = $state(false);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLElement[] = [];
	let selectMapper = $derived.by(() => {
		const result: Record<string | number, boolean> = {};
		for (const vl of value) {
			result[vl.value] = true;
		}
		return result;
	});

	/** list of options that match search query */
	let searchFilteredOptions = $derived.by(() => {
		const notSelectedOptions = rest.options.filter((opt) => !selectMapper[opt.value]);
		if (!searchQuery) return notSelectedOptions;

		return notSelectedOptions.filter((opt) =>
			opt.label.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

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
		rest.onfocus?.(evt);
		handleClick();
	};

	const toggleDropdown = (open: boolean) => (openSelect = open);

	const onClear = () => {
		input?.focus();
		searchQuery = '';
	};

	const handleSelect = (option: SelectOption) => {
		if (option.disabled) return; // disabled options cant be selected

		value = value.concat(option);
		searchQuery = '';
	};

	const handleDeselectOption = (option: SelectOption) => {
		value = value.filter((opt) => opt.value !== option.value);
	};
</script>

<!-- this common snippet is used for rendering select options -->
{#snippet selectOption({ idx, disabled, optionClassName, onclick, label }: SelectItemprops)}
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
		{label}
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

{#if label}
	<label
		for={INPUT_ID}
		class={`block mb-1.5 ${INPUT_LABEL_SIZE_STYLE_MAP[size]} font-medium ${INPUT_TYPES[variant].fg}`}
	>
		{label}
		{#if rest.required}<strong class="font-bold text-red-600!">*</strong>{/if}
	</label>
{/if}
<div
	class={`relative text-gray-700 text-base bg-white rounded-lg w-fit py-1 px-1.5 ring-1 ring-gray-200 ${className}`}
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
		{#each value.slice(0, maxDisplay || value.length) as option, idx (idx)}
			<Badge
				text={`${option.label}`}
				variant="light"
				size={SIZE_REDUCE_MAP[size]}
				onDismiss={() => handleDeselectOption(option)}
			/>
		{/each}
		{#if maxDisplay && value.length > maxDisplay}
			<Badge text={`+${value.length - maxDisplay}`} variant="light" size={SIZE_REDUCE_MAP[size]} />
		{/if}
		<!-- please dont worry about 'onfocus' error warning, it still works -->
		<Input
			{...rest}
			{variant}
			aria-controls={LISTBOX_ID}
			aria-expanded={openSelect}
			bind:ref={input}
			aria-autocomplete="list"
			autocomplete="off"
			class={`grow shrink basis-[min-content]`}
			inputClass="ring-0!"
			id={INPUT_ID}
			size={SIZE_REDUCE_MAP[size]}
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
					label: 'No data',
					value: ''
				})}
			{/if}
			{#each searchFilteredOptions as option, idx (idx)}
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
