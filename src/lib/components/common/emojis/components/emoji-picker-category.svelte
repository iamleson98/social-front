<script lang="ts">
	import { PencilMinus } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
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

<IconButton
	icon={PencilMinus}
	size="xs"
	class="tooltip tooltip-top"
	data-tip={category.label}
	color={selected ? 'blue' : 'gray'}
	variant="light"
	disabled={!enable}
	onclick={handleClick}
/>
