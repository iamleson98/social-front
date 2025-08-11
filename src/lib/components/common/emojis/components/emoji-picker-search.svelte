<script lang="ts">
	import type { KeyType } from '$lib/actions/shortcut';
	import { Search } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import type { ChangeEventHandler, KeyboardEventHandler } from 'svelte/elements';
	import { EMOJI_PER_ROW, NavigationDirection } from '../types';

	type Props = {
		value: string;
		cursorCategoryIndex: number;
		cursorEmojiIndex: number;
		focus: () => void;
		onEnter: () => void;
		// onChange: (value: string) => void;
		onKeyDown: (moveTo: NavigationDirection) => void;
		resetCursorPosition: () => void;
		ref?: HTMLInputElement;
	};

	let {
		value = $bindable(),
		cursorCategoryIndex,
		cursorEmojiIndex,
		focus,
		onEnter,
		// onChange,
		onKeyDown,
		resetCursorPosition,
		ref = $bindable(),
	}: Props = $props();

	const innerHandleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		event.preventDefault();

		// remove trailing and leading colons
		value = (event.target as HTMLInputElement).value.replace(/^:|:$/g, '');
		// onChange(value);

		resetCursorPosition();
	};

	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
		switch (event.key as KeyType) {
			case 'ArrowRight':
				if (
					(event.currentTarget?.selectionStart ?? 0) + 1 > value.length ||
					cursorCategoryIndex !== -1 ||
					cursorEmojiIndex !== -1
				) {
					event.stopPropagation();
					event.preventDefault();

					onKeyDown(NavigationDirection.NextEmoji);
				}
				break;

			case 'ArrowLeft':
				if (cursorCategoryIndex > 0 || cursorEmojiIndex > 0) {
					event.stopPropagation();
					event.preventDefault();

					onKeyDown(NavigationDirection.PreviousEmoji);
				} else if (cursorCategoryIndex === 0 && cursorEmojiIndex === 0) {
					resetCursorPosition();
					event.currentTarget.selectionStart = value.length;
					event.currentTarget.selectionEnd = value.length;

					event.stopPropagation();
					event.preventDefault();

					focus();
				}
				break;

			case 'ArrowUp':
				event.stopPropagation();
				event.preventDefault();

				if (event.shiftKey) {
					// If Shift + Ctrl/Cmd + Up is pressed at any time, select/highlight the string to the left of the cursor.
					event.currentTarget.selectionStart = 0;
				} else if (cursorCategoryIndex === -1) {
					// If cursor is on the textbox, set the cursor to the beginning of the string.
					event.currentTarget.selectionStart = 0;
					event.currentTarget.selectionEnd = 0;
				} else if (cursorCategoryIndex === 0 && cursorEmojiIndex < EMOJI_PER_ROW) {
					// If the cursor is highlighting an emoji in the top row,
					// move the cursor back into the text box to the end of the string.
					resetCursorPosition();
					event.currentTarget.selectionStart = value.length;
					event.currentTarget.selectionEnd = value.length;
					focus();
				} else {
					// Otherwise, move the emoji selector up a row.
					onKeyDown(NavigationDirection.PreviousEmojiRow);
				}
				break;

			case 'ArrowDown':
				event.stopPropagation();
				event.preventDefault();

				if (event.shiftKey) {
					// If Shift + Ctrl/Cmd + Down is pressed at any time, select/highlight the string to the right of the cursor.
					event.currentTarget.selectionEnd = value.length;
				} else if (value && event.currentTarget.selectionStart === 0) {
					// If the cursor is at the beginning of the string, move the cursor to the end of the string.
					event.currentTarget.selectionStart = value.length;
					event.currentTarget.selectionEnd = value.length;
				} else {
					// Otherwise, move the selection down in the emoji picker.
					onKeyDown(NavigationDirection.NextEmojiRow);
				}
				break;

			case 'Enter':
				event.stopPropagation();
				event.preventDefault();

				onEnter();
				break;
		}
	};
</script>

<Input
	startIcon={Search}
	placeholder="Search emoji"
	class="flex-1"
	size="sm"
	bind:value
	onkeydown={handleKeyDown}
	onchange={innerHandleChange}
	bind:ref
/>
