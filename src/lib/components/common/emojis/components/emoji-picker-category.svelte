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
	class={[
		'inline-flex w-7 h-7 items-center cursor-pointer justify-center text-gray-500 rounded-sm decoration-[none] border-none p-0 bg-transparent focus:outline-none! tooltip tooltip-top active:bg-gray-200 active:text-gray-600 hover:bg-gray-100 hover:text-gray-600',
		selected && 'bg-blue-100! text-blue-600!',
		!enable && 'pointer-events-none!',
	]}
	aria-label={category.label}
	onclick={handleClick}
	aria-pressed={selected}
	data-tip={category.label}
>
	<Icon icon={category.iconClassName} />
</button>
