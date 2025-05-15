<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Input } from '$lib/components/ui/Input';
	import { cubicInOut } from 'svelte/easing';
	import type { SocialSize } from '$lib/components/ui/common';
	import DatePicker from './DatePicker.svelte';
	import type { Snippet } from 'svelte';
	import { createFormat, parse } from './parse';
	import type { FormatToken, Locale } from './types';
	import { cloneDate, toText } from './date-utils';

	type Props = {
		class?: string;
		visible?: boolean;
		disabled?: boolean;
		dynamicPositioning?: boolean;
		size?: SocialSize;
		children?: Snippet;
		onSelect: (d: Date) => void;
		closeOnSelection?: boolean;
		text?: string;
		format?: string;
		locale?: Locale;
		value?: Date;
		valid?: boolean;
		min?: Date;
		max?: Date;
		browseWithoutSelecting?: boolean;
		timePrecision?: 'minute' | 'second' | 'millisecond';
	};

	const defaultDate = new Date();

	let {
		class: className = '',
		visible = $bindable(false),
		disabled = false,
		dynamicPositioning = false,
		size = 'sm',
		children,
		onSelect,
		text = $bindable(''),
		format = 'yyyy-MM-dd HH:mm:ss',
		locale = {},
		value = $bindable(),
		valid = $bindable(true),
		min = new Date(defaultDate.getFullYear() - 20, 0, 1),
		max = new Date(defaultDate.getFullYear(), 11, 31, 23, 59, 59, 999),
		browseWithoutSelecting = false,
		timePrecision,
		closeOnSelection = false
	}: Props = $props();

	let showAbove = $state(false);
	let pickerLeftPosition = $state<number | null>(null);
	let InputElement = $state<HTMLInputElement>();
	let pickerElement = $state<HTMLElement>();
	let formatTokens = $derived(createFormat(format, locale));
	let innerStore = $state<Date>();

	$effect(() => {
		text = toText(innerStore, formatTokens);
	});

	$effect(() => {
		if (value === undefined) {
			innerStore = undefined;
      value = value;
		} else if (innerStore && value.getTime() !== innerStore.getTime()) {
			innerStore = cloneDate(value);
      value = value;
		}
	});

	$effect(() => {
		textUpdate(text, formatTokens);
	});

	function onfocusout(e: FocusEvent) {
		if (
			e?.currentTarget instanceof HTMLElement &&
			e.relatedTarget &&
			e.relatedTarget instanceof Node &&
			e.currentTarget.contains(e.relatedTarget)
		) {
			return;
		} else {
			visible = false;
		}
	}

	function textUpdate(text: string, formatTokens: FormatToken[]) {
		if (text.length) {
			const result = parse(text, formatTokens, innerStore);
			if (result.date !== null) {
				valid = true;
				innerStore = result.date;
			} else {
				valid = false;
			}
		} else {
			valid = true; // <-- empty string is always valid
			// value resets to null if you clear the field
			if (value) {
				value = undefined;
				innerStore = undefined;
			}
		}
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && visible) {
			visible = false;
			e.preventDefault();
			// When the date picker is open, we prevent 'Escape' from propagating,
			// so for example a parent modal won't be closed
			e.stopPropagation();
		} else if (e.key === 'Enter') {
			visible = !visible;
			e.preventDefault();
		}
	}

	function setDatePickerPosition() {
		// Defaults
		showAbove = false;
		pickerLeftPosition = null;

		if (visible && pickerElement && dynamicPositioning && InputElement) {
			// The child of the dateField is what is visually seen, all calculations should use this to make sure they line up properly
			const inputRect = InputElement.getBoundingClientRect();
			const horizontalOverflow = pickerElement.offsetWidth - inputRect.width;

			const bottomThreshold = inputRect.bottom + pickerElement.offsetHeight + 5;
			const rightThreshold = inputRect.left + pickerElement.offsetWidth + 5;

			if (bottomThreshold > window.innerHeight) {
				// If .date-time-field is on the bottom half of the screen, open above
				showAbove = true;
			}
			if (rightThreshold > window.innerWidth) {
				// If date-time-field is on the right of the screen, open to the left
				pickerLeftPosition = -horizontalOverflow;

				if (inputRect.left < horizontalOverflow + 5) {
					// If it would overflow on the left too, open in the middle of the screen
					const windowCenterPos = window.innerWidth / 2;
					const newPos = windowCenterPos - pickerElement.offsetWidth / 2;
					pickerLeftPosition = newPos - inputRect.left;
				}
			}
		}
	}

	function flyAutoPosition(node: HTMLElement) {
		setDatePickerPosition();
		return fly(node, {
			duration: 200,
			easing: cubicInOut,
			y: showAbove ? 5 : -5
		});
	}

	const handleSelect = (evt: Date) => {
		onSelect?.(evt);
		if (closeOnSelection) visible = false;
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative {className}" {onfocusout} {onkeydown}>
	<Input
		{disabled}
		type="text"
		bind:ref={InputElement}
		{size}
		onfocus={() => (visible = true)}
		onmousedown={() => (visible = true)}
		oninput={(e) => {
			if (
				e instanceof InputEvent &&
				e.inputType === 'insertText' &&
				typeof e.data === 'string' &&
				e.currentTarget.value === text + e.data
			) {
				// check for missing punctuation, and add if there is any
				let result = parse(text, formatTokens, innerStore);
				if (result.missingPunctuation !== '' && !result.missingPunctuation.startsWith(e.data)) {
					text = text + result.missingPunctuation + e.data;
					return;
				}
			}
			text = e.currentTarget.value;
		}}
	/>

	{#if visible && !disabled}
		<div
			bind:this={pickerElement}
			class="absolute p-px z-10 {visible ? 'block' : 'hidden'} {showAbove ? 'bottom-full' : ''}"
			style="left: {pickerLeftPosition}px"
			transition:flyAutoPosition
		>
			<DatePicker
				{children}
				onSelect={handleSelect}
				{onfocusout}
				bind:value={innerStore}
				{min}
				{max}
				{locale}
				{browseWithoutSelecting}
				{timePrecision}
			/>
		</div>
	{/if}
</div>
