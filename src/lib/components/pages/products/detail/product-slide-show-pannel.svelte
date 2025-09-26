<script lang="ts">
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { type ProductMedia } from '$lib/gql/graphql';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';

	type Props = {
		medias: ProductMedia[];
	};

	let { medias }: Props = $props();

	let slideShowImages = $state.raw(defaultSlideShowState);

	const displayMedias = $derived(slideShowImages.medias.slice(...slideShowImages.slicing));

	$effect(() => {
		if (medias.length) {
			slideShowImages = {
				medias,
				activeIndex: 0,
				slicing: [0, Math.min(5, medias.length)],
			};
		}
	});

	const handleNavigate = (dir: 1 | -1) => {
		const newImages = { ...slideShowImages };

		const nextIndex = newImages.activeIndex + dir;

		if (nextIndex < 0) {
			if (newImages.slicing[0] === 0) return;
			newImages.slicing = newImages.slicing.map((i) => i - 1);
			slideShowImages = newImages;
			return;
		}
		if (nextIndex === newImages.slicing[1] - newImages.slicing[0]) {
			if (newImages.slicing[1] === newImages.medias.length) return;
			newImages.slicing = newImages.slicing.map((i) => i + 1);
			slideShowImages = newImages;
			return;
		}

		newImages.activeIndex = nextIndex;
		slideShowImages = newImages;
	};

	const handleKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowLeft':
				handleNavigate(-1);
			case 'ArrowRight':
				handleNavigate(1);
		}
	};

	const handleFocus = (index: number) => {
		const newImages = { ...slideShowImages };
		if (index !== newImages.activeIndex) slideShowImages = { ...newImages, activeIndex: index };
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-2">
	<div
		class="bg-no-repeat relative bg-contain bg-center bg-white justify-center pt-[100%] rounded-lg border w-full flex items-center"
		style="background-image: url('{displayMedias[slideShowImages.activeIndex].url}');"
	></div>

	<div class="w-full bg-white relative">
		<div class="w-full bg-gray-100 overflow-hidden grid grid-cols-5 gap-0.5">
			{#each displayMedias as picture, idx (idx)}
				<div class="inline-block">
					<div
						class="relative bg-white rounded-md overflow-hidden cursor-pointer outline-hidden"
						onmouseover={() => handleFocus(idx)}
						onfocus={() => handleFocus(idx)}
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
							class="absolute left-0 top-0 bottom-0 right-0 rounded-md {idx === slideShowImages.activeIndex ? 'border-2 border-blue-500' : 'border-1 border-gray-200'}"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<IconButton
			icon={ChevronLeft}
			size="xs"
			variant="outline"
			class="absolute! left-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => handleNavigate(-1)}
			aria-label="navigate previous"
		/>
		<IconButton
			icon={ChevronRight}
			size="xs"
			variant="outline"
			class="absolute! right-1.5 top-1/2 -translate-y-1/2 z-10"
			rounded
			onclick={() => handleNavigate(1)}
			aria-label="navigate next"
		/>
	</div>
</div>
