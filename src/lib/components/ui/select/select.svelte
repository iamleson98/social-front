<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { classNames, randomID } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	import { Input } from '$lib/components/ui/Input';
	import { SELECT_CLASSES, type SelectOption, type SelectProps } from './types';
	import { INPUT_CLASSES } from '$lib/components/ui/Input/input.types';
	import { scrollToEnd } from '$lib/actions/scroll-end';
	import { noop } from 'es-toolkit';
	import SelectOptionComponent from './select-option-component.svelte';
	import SelectAction from './select-action.svelte';

	let {
		options,
		value = $bindable<SelectOption['value'] | undefined>(),
		onchange,
		class: className = '',
		subText,
		variant = 'info',
		inputDebounceOption,
		onScrollToEnd = noop,
		isFetchingMore,
		...rest
	}: SelectProps = $props();

	const ID = randomID();
	const INPUT_ID = `combobox-${ID}`;
	const LISTBOX_ID = `listbox-${ID}`;

	let searchQuery = $state('');
	let openSelect = $state(false);
	let selectedOption = $derived.by(() =>
		value ? options.find((opt) => opt.value === value) : undefined,
	);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLLIElement[] = [];

	/** list of options that match search query */
	let filteredOptions = $derived.by(() =>
		searchQuery
			? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
			: options,
	);

	const onInput = (evt: Event) => {
		toggleDropdown(true);
		searchQuery = input?.value.trim() ?? '';
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });

		// pass result to parent
		inputDebounceOption?.onInput(evt);
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
		},
	) => {
		if (rest.onfocus) rest.onfocus(evt);
		activate();
	};

	const toggleDropdown = (open: boolean) => (openSelect = open);

	const onClear = () => {
		if (rest.disabled) return;

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

{#snippet action()}
	<SelectAction {value} {onClear} {openSelect} />
{/snippet}

<div
	class="relative w-full text-gray-700 text-base {className}"
	use:clickOutside={{ onOutclick: deactivate }}
	use:focusOutside={{ onFocusOut: deactivate }}
	use:shortcuts={[
		{
			shortcut: { key: 'Escape' },
			onShortcut: (event) => {
				event.stopPropagation();
				toggleDropdown(false);
			},
		},
	]}
>
	<Input
		{...rest}
		aria-controls={LISTBOX_ID}
		aria-expanded={openSelect}
		bind:ref={input}
		aria-autocomplete="list"
		autocomplete="off"
		id={INPUT_ID}
		{variant}
		onclick={activate}
		onfocus={handleFocus}
		value={selectedOption?.label}
		type="text"
		role="combobox"
		inputDebounceOption={{
			onInput,
			debounceTime: inputDebounceOption?.debounceTime,
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
			use:scrollToEnd={{ onScrollToEnd }}
		>
			{#if !filteredOptions.length}
				<SelectOptionComponent
					idx={0}
					optionClassName="cursor-default"
					onclick={() => toggleDropdown(false)}
					label="No data"
					value=""
					ref={optionRefs[0]}
				/>
			{/if}
			{#each filteredOptions as option, idx (idx)}
				<SelectOptionComponent
					{idx}
					optionClassName={classNames({
						'cursor-not-allowed! text-gray-400!': !!option.disabled,
						[SELECT_CLASSES.activeSelectOption]: option.value === value,
					})}
					onclick={() => handleSelect(option)}
					ref={optionRefs[idx]}
					{...option}
				/>
			{/each}
			{#if isFetchingMore}
				<li class={SELECT_CLASSES.selectOption}>
					<span class="loading loading-spinner loading-xs"></span>
				</li>
			{/if}
		</ul>
	{/if}
	{#if subText}
		<div class={`text-[10px] mt-0.5 text-right! ${INPUT_CLASSES[variant].fg}`}>{subText}</div>
	{/if}
</div>
