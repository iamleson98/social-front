<script lang="ts">
	import { ChevronLeft, ChevronRight, Icon, Photo } from '$lib/components/icons';
	import type { ProductMedia } from '$lib/gql/graphql';
	import { AnimateSharedLayout, Motion } from 'svelte-motion';

	/** both product's medias and produst's variants' medias */
	export let allProductMedias: ProductMedia[] = [];

	/** whether to show skeleton or all medias */
	export let loading: boolean;

	let selectedMediaIdx = allProductMedias.length ? 0 : null;

	/**
	 * @param dir - 1 for next, -1 for previous
	 */
	const handleSlide = (dir: -1 | 1) => () => {
		if (selectedMediaIdx === null) return;
		selectedMediaIdx = (selectedMediaIdx + dir + allProductMedias.length) % allProductMedias.length;
	};
</script>

{#if loading}
	<div class="p-1 h-full rounded w-full bg-white">
		<div class="bg-gray-300 animate-pulse w-full h-full pt-[100%]">
		</div>
	</div>
	<div class="prd-slide animate-pulse">
		{#each new Array(5).fill(null) as _, idx (idx)}
			<div class="slide-item">
				<div class="prd-thumbnail bg-gray-300"></div>
			</div>
		{/each}
	</div>
{:else}
	{#if selectedMediaIdx !== null}
		<div
			class="prd-display-main"
			style="background-image: url('{allProductMedias[selectedMediaIdx].url}');"
		></div>
	{:else}
		<div class="prd-display-main">
			<Icon icon={Photo} />
		</div>
	{/if}

	<AnimateSharedLayout>
		<div class="prd-slide">
			{#each allProductMedias as media, idx (idx)}
				<button class="slide-item" tabindex="0" on:click={() => (selectedMediaIdx = idx)}>
					<div class="prd-thumbnail" style="background-image: url('{media.url}');"></div>
					{#if selectedMediaIdx === idx}
						<Motion let:motion layoutId="slide-outline" initial={false}>
							<div class="slide-outline" use:motion></div>
						</Motion>
					{/if}
				</button>
			{/each}

			<button
				class="left-2 slide-btn"
				tabindex="0"
				disabled={selectedMediaIdx === null}
				on:click={handleSlide(-1)}
			>
				<Icon icon={ChevronLeft} />
			</button>

			<button
				class="right-2 slide-btn"
				tabindex="0"
				disabled={selectedMediaIdx === null}
				on:click={handleSlide(+1)}
			>
				<Icon icon={ChevronRight} />
			</button>
		</div>
	</AnimateSharedLayout>
{/if}

<style lang="postcss">
	.slide-outline {
		@apply absolute border-2 z-10 border-blue-400 w-full h-full rounded top-0 left-0;
	}
	.slide-item {
		@apply inline-block p-1 w-1/5 relative rounded;
		-webkit-tap-highlight-color: transparent;
	}
	.prd-display-main {
		@apply bg-no-repeat relative bg-contain bg-center bg-white justify-center pt-[100%] rounded w-full flex items-center;
	}
	.prd-thumbnail {
		@apply rounded bg-contain bg-no-repeat bg-center pt-[100%];
	}
	.prd-slide {
		@apply relative w-full bg-white flex items-center;
	}
	.slide-btn {
		@apply rounded-full w-7 h-7 absolute top-1/2 -translate-y-1/2 bg-gray-100 transform hover:bg-gray-200 flex items-center justify-center;
	}
</style>
