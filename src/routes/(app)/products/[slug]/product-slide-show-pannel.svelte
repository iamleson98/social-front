<script lang="ts">
	import { ChevronLeft, ChevronRight, Icon, Photo } from '$lib/components/icons';
	import type { ProductMedia } from '$lib/gql/graphql';
	import { AnimateSharedLayout, Motion } from 'svelte-motion';

	export let medias: ProductMedia[] = [];

	let selectedMediaIdx = medias.length ? 0 : null;

	/**
	 * @param dir - 1 for next, -1 for previous
	 */
	const handleSlide = (dir: -1 | 1) => () => {
		if (selectedMediaIdx === null) return;
		selectedMediaIdx = (selectedMediaIdx + dir + medias.length) % medias.length;
	};
</script>

{#if selectedMediaIdx !== null}
	<div
		class="prd-display-main"
		style="background-image: url('{medias[selectedMediaIdx].url}');"
	></div>
{:else}
	<div class="prd-display-main">
		<Icon icon={Photo} />
	</div>
{/if}

<AnimateSharedLayout>
	<div class="prd-slide">
		<div class="prd-slide-main">
			{#each medias as media, idx (idx)}
				<button class="slide-item" tabindex="0" on:click={() => (selectedMediaIdx = idx)}>
					<div class="prd-thumbnail" style="background-image: url('{media.url}');"></div>
					{#if selectedMediaIdx === idx}
						<Motion let:motion layoutId="slide-outline" initial={false}>
							<div class="slide-outline" use:motion></div>
						</Motion>
					{/if}
				</button>
			{/each}
		</div>

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

<style lang="postcss">
	.slide-outline {
		@apply absolute border-2 z-10 border-blue-400 w-full h-full rounded top-0 left-0;
	}
	.slide-item {
		@apply inline-block p-1 w-1/5 relative rounded;
		-webkit-tap-highlight-color: transparent;
	}
	.prd-display-main {
		@apply rounded w-full bg-no-repeat relative bg-contain bg-center bg-white flex items-center justify-center;
		padding-top: 100% !important;
	}
	.prd-thumbnail {
		@apply rounded bg-contain bg-no-repeat bg-center;
		padding-top: 100% !important;
	}
	.prd-slide {
		@apply relative w-full bg-white;
	}
	.slide-btn {
		@apply rounded-full w-7 h-7 absolute top-1/2 -translate-y-1/2 bg-gray-100 transform hover:bg-gray-200 flex items-center justify-center;
	}
</style>
