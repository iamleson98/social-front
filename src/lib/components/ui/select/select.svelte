<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon, Search } from '$lib/components/icons';
	import { DEBOUNCE_INPUT_TIME } from '$lib/utils/consts';
	import { randomID } from '$lib/utils/utils';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { fromDomEvent, pipe, subscribe, debounce } from 'wonka';

	type Option = {
		value: string;
		label: string;
	};

	type SnippetProps = {
		/** default `false` */
		disabled: boolean;
		idx: number;
		value: string;
		className: string;
		onclick?: () => void;
	};

	type Props = {
		options: Option[];
		/** placeholder value */
		placeholder?: string;
		/** default `false` */
		hideLabel?: boolean;
		label: string;
		selectedOption?: Option;
		onSelect?: (option?: Option) => void;
		/** default `false` */
		disabled?: boolean;
	};

	let {
		options,
		placeholder = 'Enter a value',
		hideLabel = false,
		label,
		selectedOption,
		onSelect,
		disabled = false
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

	$effect(() => {
		const { unsubscribe } = pipe(
			fromDomEvent(input, 'input'),
			debounce(() => DEBOUNCE_INPUT_TIME),
			subscribe((_) => {
				openDropdown();
				searchQuery = input.value.trim();
				selectedIndex = undefined;
				optionRefs[0]?.scrollIntoView({ block: 'nearest' });
			})
		);

		return unsubscribe;
	});

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

	const handleSelect = (option: Option) => {
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
		class={`${className} text-left w-full px-4 py-2 hover:bg-gray-100 aria-selected:bg-gray-100`}
		bind:this={optionRefs[idx]}
		{onclick}
	>
		{value}
	</li>
{/snippet}

<label for={inputId} class:sr-only={hideLabel}>{label}</label>
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
			class="text-left w-full !pr-12 transition-all"
			id={inputId}
			onclick={activate}
			onfocus={activate}
			value={searchQuery}
			type="text"
			role="combobox"
			use:shortcuts={[
				{
					shortcut: { key: 'ArrowUp' },
					onShortcut: () => {
						openDropdown();
						void incrementSelectedIndex(-1);
					}
				},
				{
					shortcut: { key: 'ArrowDown' },
					onShortcut: () => {
						openDropdown();
						void incrementSelectedIndex(1);
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

	<ul
		role="listbox"
		id={listboxId}
		transition:fly={{ duration: 250 }}
		class="absolute text-left text-sm w-full max-h-64 overflow-y-auto bg-white border-t-0 border-gray-300 rounded-b-xl z-10"
		class:border={openSelect}
		tabindex="-1"
	>
		{#if openSelect}
			{#if filteredOptions.length === 0}
				{@render selectOption({
					idx: 0,
					disabled: true,
					className: 'cursor-default',
					onclick: closeDropdown,
					value: 'No results found'
				})}
			{/if}
			{#each filteredOptions as option, idx (option.label)}
				{@render selectOption({
					idx,
					disabled: false,
					className: 'cursor-pointer transition-all',
					onclick: () => handleSelect(option),
					value: option.label
				})}
			{/each}
		{/if}
	</ul>
</div>