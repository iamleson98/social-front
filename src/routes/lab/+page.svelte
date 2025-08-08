<script lang="ts">
	import { EmojiPicker } from '$lib/components/common/emojis';
	import EmojiMap from '$lib/components/common/emojis/emoji-map';
	import type { ActionResult, CustomEmoji } from '$lib/components/common/emojis/types';
	import { createVirtualizer, type SvelteVirtualizer } from '@tanstack/svelte-virtual';
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	let virtualListEl = $state<HTMLDivElement>();
	let virtualizer = $state<Readable<SvelteVirtualizer<HTMLDivElement, HTMLDivElement>>>();

	onMount(() => {
		virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
			count: 10000,
			getScrollElement: () => virtualListEl!,
			estimateSize: () => 30,
			overscan: 5,
			horizontal: false,
		});
	});

	let filter = $state('');

	const increment = async (): Promise<{data: boolean}> => {
		return {data: true};
	}

	const getCustomEmojis = (page?: number, perPage?: number, sort?: string, loadUsers?: boolean): Promise<ActionResult<CustomEmoji[]>> => {
		// return {data: []};
		return Promise.resolve({data: []});
	}
</script>

<EmojiPicker
	bind:filter
	onEmojiClick={() => {}}
	handleFilterChange={() => {}}
	handleEmojiPickerClose={() => {}}
	incrementEmojiPickerPage={increment}
	getCustomEmojis={getCustomEmojis}
	emojiMap={new EmojiMap(new Map())}
	recentEmojis={[]}
/>
