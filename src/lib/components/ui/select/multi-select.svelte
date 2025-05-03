<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon } from '$lib/components/icons';
	import { randomID } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	import { Input, Label } from '../Input';
	import {
		SELECT_CLASSES,
		type SelectItemprops,
		type SelectOption,
		type MultiSelectProps,
		SIZE_REDUCE_MAP
	} from './types';
	import { Badge } from '../badge';
	import type { FocusEventHandler } from 'svelte/elements';
	import { INPUT_CLASSES } from '../Input/input.types';

	let {
		value = $bindable<SelectOption[]>([]),
		class: className = '',
		maxDisplay,
		size = 'md',
		label,
		variant = 'info',
		onchange,
		options,
		subText,
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
		const notSelectedOptions = options.filter((opt) => !selectMapper[opt.value]);
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
		onchange?.(value);
	};

	const handleDeselectOption = (option: SelectOption) => {
		value = value.filter((opt) => opt.value !== option.value);
		onchange?.(value);
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
	<Label {label} id={INPUT_ID} required={rest.required} {size} {variant} requiredAtPos="end" />
{/if}
<div
	class={`relative rounded-lg w-fit py-1 px-1.5 ${INPUT_CLASSES[variant].bg} ${className}`}
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
	role="menu"
	tabindex="0"
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
		<Input
			{...rest}
			variant="ghost"
			aria-controls={LISTBOX_ID}
			aria-expanded={openSelect}
			bind:ref={input}
			aria-autocomplete="list"
			autocomplete="off"
			class={`grow shrink basis-[min-content]`}
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
			class="{SELECT_CLASSES.selectMenu} mt-2!"
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
	{#if subText}
		<div class={`text-[10px] mt-0.5 text-right! ${INPUT_CLASSES[variant].fg}`}>{subText}</div>
	{/if}
</div>
