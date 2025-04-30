<script lang="ts">
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { slideShowManager } from '$lib/stores/ui/slideshow';

	let displayMedias = $derived.by(() =>
		$slideShowManager.medias.slice(...$slideShowManager.slicing)
	);

	const handleKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowLeft':
				slideShowManager.handleNavigate(-1);
			case 'ArrowRight':
				slideShowManager.handleNavigate(1);
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-2">
	<div
		class="bg-no-repeat relative bg-contain bg-center bg-white justify-center pt-[100%] rounded-lg border w-full flex items-center"
		style="background-image: url('{displayMedias[$slideShowManager.activeIndex].url}');"
	></div>

	<div class="w-full bg-white relative">
		<div class="w-full bg-gray-100 overflow-hidden">
			{#each displayMedias as picture, idx (idx)}
				<div class="w-1/5 p-1 inline-block box-border">
					<div
						class="relative bg-white rounded-md overflow-hidden cursor-pointer outline-hidden"
						onmouseover={() => slideShowManager.handleFocus(idx)}
						onfocus={() => slideShowManager.handleFocus(idx)}
						tabindex="0"
						role="button"
					>
						<div class="relative w-full pb-[100%]">
							<picture class="contents">
								<source
									src={picture.url}
									type="image/webp"
									class="absolute h-full left-0 object-contain object-center right-0 w-full"
								/>
								<img
									src={picture.url}
									alt={picture.alt}
									class="absolute h-full left-0 object-contain object-center right-0 w-full"
								/>
							</picture>
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
			class="absolute! left-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => slideShowManager.handleNavigate(-1)}
			aria-label="navigate previous"
		/>
		<IconButton
			icon={ChevronRight}
			size="xs"
			variant="light"
			class="absolute! right-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => slideShowManager.handleNavigate(1)}
			aria-label="navigate next"
		/>
	</div>
</div>
