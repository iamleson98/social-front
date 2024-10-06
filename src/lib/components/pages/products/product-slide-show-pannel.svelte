<script lang="ts">
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { slideShowManager } from '$lib/stores/ui/slidehow';

	let displayMedias = $derived.by(() => {
		return $slideShowManager.medias.slice(...$slideShowManager.slicing);
	});

	const handleKeydown = (id: string) => (e: KeyboardEvent) => {
		if (id !== 'slideShow') return;

		if (e.key === 'ArrowLeft') {
			slideShowManager.handleNavigate(-1);
		} else if (e.key === 'ArrowRight') {
			slideShowManager.handleNavigate(1);
		}
	};
</script>

<svelte:window onkeydown={handleKeydown('slideShow')} />

<div class="w-2/5 tablet:w-full flex flex-col gap-2">
	<div
		class="prd-display-main"
		style="background-image: url('{displayMedias[$slideShowManager.activeIndex].url}');"
	></div>

	<div class="w-full bg-white relative">
		<div class="w-full bg-gray-100 overflow-hidden">
			{#each displayMedias as picture, idx (idx)}
				<div class="w-1/5 p-1 inline-block box-border">
					<div
						class="relative bg-white rounded-md overflow-hidden cursor-pointer outline-none"
						onmouseover={() => slideShowManager.handleFocus(idx)}
						onfocus={() => slideShowManager.handleFocus(idx)}
						tabindex="0"
						role="button"
					>
						<div class="relative w-full pb-[100%]">
							<img
								src={picture.url}
								alt={picture.alt}
								loading="lazy"
								class="absolute h-full left-0 object-contain object-center right-0 w-full"
							/>
						</div>

						<div
							class={`absolute left-0 top-0 bottom-0 right-0 rounded-md ${idx === $slideShowManager.activeIndex ? 'border-blue-500 border-2' : ''}`}
						></div>
					</div>
				</div>
			{/each}
		</div>

		<IconButton
			icon={ChevronLeft}
			size="xs"
			variant="light"
			class="absolute left-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => slideShowManager.handleNavigate(-1)}
		/>
		<IconButton
			icon={ChevronRight}
			size="xs"
			variant="light"
			class="absolute right-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => slideShowManager.handleNavigate(1)}
		/>
	</div>
</div>

<style lang="postcss">
	.slide-outline {
		@apply absolute border-2 z-10 border-blue-400 w-full h-full rounded top-0 left-0;
	}
	.slide-item {
		@apply inline-block p-1 w-1/5 relative rounded;
		-webkit-tap-highlight-color: transparent;
	}
	.prd-display-main {
		@apply bg-no-repeat relative bg-contain bg-center bg-white justify-center pt-[100%] rounded-md border w-full flex items-center;
	}
	.prd-thumbnail {
		@apply rounded bg-contain bg-no-repeat bg-center pt-[100%];
	}
	.prd-slide {
		@apply relative w-full bg-white overflow-x-hidden rounded-md border min-h-20;
	}
	.slide-btn {
		@apply rounded-full w-7 h-7 absolute top-1/2 -translate-y-1/2 bg-gray-100 transform hover:bg-gray-200 flex items-center justify-center cursor-pointer;
	}
</style>
