<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { focusOutside } from '$lib/actions/focus-outside';
	import { shortcuts } from '$lib/actions/shortcut';
	import { ChevronSort, CloseX, Icon } from '$lib/components/icons';
	import { classNames, randomID } from '$lib/utils/utils';
	import { fly } from 'svelte/transition';
	import { Input, Label } from '$lib/components/ui/Input';
	import {
		SELECT_CLASSES,
		type SelectItemprops,
		type SelectOption,
		type SelectProps,
		SIZE_REDUCE_MAP,
		type Primitive,
	} from './types';
	import type { FocusEventHandler } from 'svelte/elements';
	import { INPUT_CLASSES } from '$lib/components/ui/Input/input.types';
	import { Badge } from '$lib/components/ui/badge';
	import { INPUT_BUTTON_SIZE_MAP } from '../Button';
	import { noop } from 'es-toolkit';
	import { scrollToEnd } from '$lib/actions/scroll-end';

	let {
		value = $bindable<Primitive | Primitive[] | undefined>(),
		class: className = '',
		maxDisplay,
		size = 'md',
		label,
		variant = 'info',
		onchange,
		options,
		subText,
		inputDebounceOption,
		multiple = false,
		showLoadingMore,
		onScrollToEnd = noop,
		onclearInputField,
		...rest
	}: SelectProps = $props();

	if (typeof maxDisplay === 'number' && maxDisplay <= 0) throw new Error('maxDisplay must be > 0');

	const ID = randomID();
	const INPUT_ID = `combobox-${ID}`;
	const LISTBOX_ID = `listbox-${ID}`;

	let searchQuery = $state('');
	let openSelect = $state(false);
	let input = $state<HTMLInputElement>();
	let optionRefs: HTMLElement[] = [];
	/** mapping for selected options */
	let copySelectMapper = {} as Record<Primitive, SelectOption>;

	let selectMapper = $derived.by(() => {
		let res: Record<Primitive, SelectOption> = { ...copySelectMapper };

		if (multiple && Array.isArray(value)) {
			for (const val of value) {
				if (!res[val]) delete res[val];
				else res[val] = options.find((opt) => opt.value === val)!;
			}
		} else if (value) {
			res = { [value]: options.find((opt) => opt.value === value)! };
		}

		copySelectMapper = { ...res };
		return res;
	});

	/** display text for input */
	let inputDisplayText = $derived.by(() => {
		if (multiple) return searchQuery;
		return typeof value !== undefined ? selectMapper[value as Primitive]?.label : undefined;
	});

	/** list of options that match search query */
	let searchFilteredOptions = $derived.by(() => {
		if (!searchQuery) return options;
		return options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()));
	});

	const onInput = (evt: Event) => {
		toggleDropdown(true);
		searchQuery = input?.value.trim() ?? '';
		optionRefs[0]?.scrollIntoView({ block: 'nearest' });

		// pass result to parent
		inputDebounceOption?.onInput(evt);
	};

	const onOutclick = (evt: any) => {
		toggleDropdown(false);
		rest.onblur?.(evt);
	};

	const handleClick = () => {
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

		if (!multiple) {
			// in multiple query we only clear the value and selectMapper
			// the selected values will be kept
			value = undefined;
		}
		onclearInputField?.();
	};

	const handleSelect = (option: SelectOption) => {
		if (option.disabled || selectMapper[option.value]) return; // disabled options cant be selected

		if (multiple) {
			if (value === undefined) {
				value = [];
			}
			if (!(value as Primitive[]).includes(option.value)) {
				value = (value as Primitive[]).concat(option.value);
			}
		} else {
			value = option.value;
		}

		if (!multiple) toggleDropdown(false);
		onchange?.(multiple ? Object.values(selectMapper) : option);
	};

	const handleDeselectOption = (option: SelectOption) => {
		if (rest.disabled) return;

		if (multiple && Array.isArray(value)) {
			value = value.filter((opt) => opt !== option.value);
		} else {
			value = undefined;
		}

		onchange?.(multiple ? Object.values(selectMapper) : undefined);
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
				onShortcut: () => onclick?.(),
			},
		]}
	>
		{label}
	</li>
{/snippet}

{#snippet action()}
	{#if searchQuery || (!multiple && value)}
		<span
			onclick={onClear}
			role="button"
			tabindex="0"
			onkeydown={(evt) => evt.key === 'Enter' && onClear()}
			class={classNames({
				'cursor-pointer': !rest.disabled,
				'cursor-not-allowed!': !!rest.disabled,
			})}
			title="Clear"
			aria-label="Clear"
		>
			<Icon icon={CloseX} size="xs" />
		</span>
	{:else if !openSelect}
		<Icon icon={ChevronSort} size="xs" />
	{/if}
{/snippet}

<div
	class={`${className} relative`}
	use:clickOutside={{ onOutclick }}
	use:focusOutside={{ onFocusOut: onOutclick }}
	use:shortcuts={[
		{
			shortcut: { key: 'Escape' },
			onShortcut: (event) => {
				event.stopPropagation();
				toggleDropdown(false);
			},
		},
	]}
	role="menu"
	tabindex="0"
>
	{#if label}
		<Label {label} id={INPUT_ID} required={rest.required} {size} {variant} requiredAtPos="end" />
	{/if}
	<div
		class={`flex items-center rounded-lg py-1 pr-0.5 pl-1 ${INPUT_CLASSES[variant].bg} ${INPUT_BUTTON_SIZE_MAP[size]}`}
	>
		<div class="flex flex-wrap items-center gap-1 flex-1">
			{#if multiple && Array.isArray(value)}
				{@const list = value.slice(0, maxDisplay || value.length)}
				{#each list as option, idx (idx)}
					<Badge
						text={`${selectMapper[option]?.label}`}
						variant="light"
						size={SIZE_REDUCE_MAP[size]}
						onDismiss={() => handleDeselectOption(selectMapper[option])}
						disabled={rest.disabled}
					/>
				{/each}
				{#if maxDisplay && value.length > maxDisplay}
					<Badge
						text={`+${value.length - maxDisplay}`}
						variant="light"
						size={SIZE_REDUCE_MAP[size]}
					/>
				{/if}
			{/if}
			<Input
				{...rest}
				variant="ghost"
				aria-controls={LISTBOX_ID}
				aria-expanded={openSelect}
				bind:ref={input}
				aria-autocomplete="list"
				autocomplete="off"
				class={`flex-1 basis-[min-content]`}
				id={INPUT_ID}
				size={SIZE_REDUCE_MAP[size]}
				onclick={handleClick}
				onfocus={handleFocus}
				value={inputDisplayText}
				type="text"
				role="combobox"
				inputDebounceOption={{
					onInput,
					debounceTime: inputDebounceOption?.debounceTime,
				}}
				{action}
			/>
		</div>
	</div>
	{#if openSelect}
		<ul
			role="listbox"
			id={LISTBOX_ID}
			transition:fly={{ duration: 250, y: 10 }}
			class={SELECT_CLASSES.selectMenu}
			tabindex="0"
			use:scrollToEnd={{ onScrollToEnd }}
		>
			{#if !searchFilteredOptions.length}
				{@render selectOption({
					idx: 0,
					disabled: true,
					optionClassName: 'cursor-default',
					onclick: () => toggleDropdown(false),
					label: 'No data',
					value: '',
				})}
			{/if}
			{#each searchFilteredOptions as option, idx (idx)}
				{@render selectOption({
					idx,
					optionClassName: classNames({
						'cursor-not-allowed! text-gray-400!': !!option.disabled,
						[SELECT_CLASSES.activeSelectOption]: selectMapper[option.value] !== undefined,
					}),
					onclick: () => handleSelect(option),
					...option,
				})}
			{/each}
			{#if showLoadingMore}
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
