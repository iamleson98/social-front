<script lang="ts">
	import Icon from '$lib/components/icons/icon.svelte';
	import type { Category, CategoryOrEmojiRow, EmojiCategory } from '../types';

	type Props = {
		category: Category;
		selected: boolean;
		categoryRowIndex: CategoryOrEmojiRow['index'];
		enable: boolean;
		onclick: (
			categoryRowIndex: CategoryOrEmojiRow['index'],
			categoryName: EmojiCategory,
			firstEmojiId: string,
		) => void;
	};

	let { category, selected, categoryRowIndex, enable, onclick }: Props = $props();

	const handleClick = (evt: MouseEvent) => {
		evt.preventDefault();

		if (enable) {
			const firstEmojiId = category?.emojiIds?.[0] ?? '';
			onclick(categoryRowIndex, category.name, firstEmojiId);
		}
	};
</script>

<button
	class={['emoji-picker-category', selected && 'selected', !enable && 'pointer-events-none!']}
	aria-label={category.label}
	onclick={handleClick}
	aria-pressed={selected}
>
	<Icon icon={category.iconClassName} />
</button>

<style lang="postcss">
	@reference "tailwindcss";

	.emoji-picker-category {
		@apply inline-flex w-7 h-7 items-center justify-center rounded-sm decoration-[none] border-none p-0 bg-transparent focus:outline-none!;
	}

	.emoji-picker-category:hover {
		@apply bg-gray-200 text-gray-500;
	}

	.emoji-picker-category:active {
		@apply bg-gray-300 text-gray-600;
	}

	.emoji-picker-category.selected {
		@apply bg-blue-100 text-blue-600;
	}
</style>
