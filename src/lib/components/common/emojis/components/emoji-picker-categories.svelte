<script lang="ts">
	import {
		NavigationDirection,
		type Categories,
		type CategoryOrEmojiRow,
		type EmojiCategory,
	} from '../types';
	import { calculateCategoryRowIndex } from '../utils';
	import EmojiPickerCategory from './emoji-picker-category.svelte';

	type Props = {
		isFiltering: boolean;
		active: EmojiCategory;
		categories: Categories;
		onclick: (
			categoryRowIndex: CategoryOrEmojiRow['index'],
			categoryNem: EmojiCategory,
			firstEmojiId: string,
		) => void;
		onkeydown: (moveTo: NavigationDirection) => void;
		focusOnSearchInput: () => void;
	};

	let { isFiltering, active, categories, onclick, onkeydown, focusOnSearchInput }: Props = $props();

	const handleKeyDown = (evt: KeyboardEvent) => {
		evt.stopPropagation();
		evt.preventDefault();

		switch (evt.key) {
			case 'ArrowRight':
				onkeydown(NavigationDirection.NextEmoji);
				focusOnSearchInput();
				break;
			case 'ArrowLeft':
				onkeydown(NavigationDirection.PreviousEmoji);
				focusOnSearchInput();
				break;
			case 'ArrowUp':
				onkeydown(NavigationDirection.PreviousEmojiRow);
				focusOnSearchInput();
				break;
			case 'ArrowDown':
				onkeydown(NavigationDirection.NextEmojiRow);
				focusOnSearchInput();
				break;
		}
	};

	const categoryNames = Object.keys(categories) as EmojiCategory[];
	const activeCategory = isFiltering ? categoryNames[0] : active;
</script>

<div class={['flex grow-0 shrink-0 justify-between py-0 px-3  mb-2']} onkeydown={handleKeyDown} role="menu" tabindex="-1">
	{#each categoryNames as categoryName, idx (idx)}
		{@const category = categories[categoryName]}
		<EmojiPickerCategory
			{category}
			categoryRowIndex={calculateCategoryRowIndex(categories, categoryName)}
			{onclick}
			selected={activeCategory === category.name}
			enable={!isFiltering}
		/>
	{/each}
</div>
