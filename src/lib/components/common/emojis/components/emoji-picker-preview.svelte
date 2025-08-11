<script lang="ts">
	import type { Emoji } from '../types';
	import { getEmojiImageUrl, isSystemEmoji } from '../utils';
	import imgTrans from './img_trans.gif';

	type Props = {
		emoji?: Emoji;
	};

	let { emoji }: Props = $props();
</script>

<div
	class={['overflow-hidden m-3 bg-white text-ellipsis whitespace-nowrap', !emoji && 'font-bold']}
>
	{#if !emoji}
		<span>Select an Emoji</span>
	{:else}
		<div class="mr-3 flex items-center gap-2">
			{#if isSystemEmoji(emoji)}
				<span class="sprite-preview">
					<img
						id="emojiPickerSpritePreview"
						alt={'emoji category image'}
						src={imgTrans}
						class={'emojisprite-preview emoji-category-' +
							emoji.category +
							' emoji-' +
							emoji.unified.toLowerCase()}
					/>
				</span>
			{:else}
				<img
					id="emojiPickerSpritePreview"
					alt={'emoji preview image'}
					class="emoji-picker__preview-image"
					src={getEmojiImageUrl(emoji)}
				/>
			{/if}

			<span class="text-sm text-gray-600">:{isSystemEmoji(emoji) ? emoji.short_names.join(': :') : emoji.name}:</span>
		</div>
	{/if}
</div>
