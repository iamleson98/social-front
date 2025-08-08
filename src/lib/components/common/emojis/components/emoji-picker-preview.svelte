<script lang="ts">
	import type { Emoji } from '../types';
	import { isSystemEmoji } from '../utils';

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
<div class="mr-3 align-middle">
  {#if isSystemEmoji(emoji)}
    
  {:else}
    
  {/if}
</div>
		
	{/if}
</div>
