<script lang="ts" module>
	export type Props = {
		rating?: number;
	};
</script>

<script lang="ts">
	let { rating = 0 }: Props = $props();
</script>

<div>
	<div class="flex space-x-1">
		{#each Array(5) as _, index}
			{#if index < rating}
				<img
					src="https://cdn-icons-png.flaticon.com/128/2107/2107957.png"
					alt="Filled Star"
					class="w-[15px] h-[15px] mt-2"
				/>
			{:else}
				<img
					src="https://cdn-icons-png.flaticon.com/128/13077/13077454.png"
					alt="Empty Star"
					class="w-[15px] h-[15px] mt-2"
				/>
			{/if}
		{/each}
	</div>

	<div class="mt-2 ml-auto flex">
		<div class="flex-grow"></div>
		{#if rating < 3}
			<img
				src="https://cdn-icons-png.flaticon.com/128/15348/15348745.png"
				alt="Sad Emoji"
				class="w-[15px] h-[15px]"
			/>
		{:else if rating == 5}
			<img
				src="https://cdn-icons-png.flaticon.com/128/2584/2584606.png"
				alt="Happy Emoji"
				class="w-[15px] h-[15px]"
			/>
		{:else}
			<img
				src="https://cdn-icons-png.flaticon.com/128/3129/3129282.png"
				alt="Neutral Emoji"
				class="w-[15px] h-[15px]"
			/>
		{/if}
	</div>
</div>
