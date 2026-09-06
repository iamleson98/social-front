<script lang="ts">
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { type ProductMedia } from '$lib/gql/graphql';
	import { defaultSlideShowState } from '$lib/stores/ui/slideshow';

	interface Props {
		medias: ProductMedia[];
	}

	const { medias }: Props = $props();

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

	const handleNavigate = (dir: 1 | -1): void => {
		const newImages = { ...slideShowImages };

		const nextIndex = newImages.activeIndex + dir;

		if (nextIndex < 0) {
			if (newImages.slicing[0] === 0) {
				return;
			}
			newImages.slicing = newImages.slicing.map((i) => i - 1);
			slideShowImages = newImages;
			return;
		}
		if (nextIndex === newImages.slicing[1] - newImages.slicing[0]) {
			if (newImages.slicing[1] === newImages.medias.length) {
				return;
			}
			newImages.slicing = newImages.slicing.map((i) => i + 1);
			slideShowImages = newImages;
			return;
		}

		newImages.activeIndex = nextIndex;
		slideShowImages = newImages;
	};

	const handleKeydown = (e: KeyboardEvent): void => {
		switch (e.key) {
			case 'ArrowLeft':
				handleNavigate(-1);
				break;
			case 'ArrowRight':
				handleNavigate(1);
				break;
		}
	};

	const handleFocus = (index: number): void => {
		const newImages = { ...slideShowImages };
		if (index !== newImages.activeIndex) {
			slideShowImages = { ...newImages, activeIndex: index };
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col gap-2.5">
	<!-- main image -->
	<div
		class="group relative w-full overflow-hidden rounded-2xl bg-white border border-gray-200 cursor-zoom-in"
		role="img"
		aria-label={displayMedias[slideShowImages.activeIndex].alt || 'product image'}
	>
		<div
			class="bg-no-repeat bg-contain bg-center w-full pt-[100%] transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
			style="background-image: url('{displayMedias[slideShowImages.activeIndex].url}');"
		></div>

		{#if displayMedias.length > 1}
			<IconButton
				icon={ChevronLeft}
				size="sm"
				variant="light"
				class="absolute! left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90! shadow-sm backdrop-blur-sm hover:bg-white!"
				rounded
				onclick={() => handleNavigate(-1)}
				aria-label="navigate previous"
			/>
			<IconButton
				icon={ChevronRight}
				size="sm"
				variant="light"
				class="absolute! right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90! shadow-sm backdrop-blur-sm hover:bg-white!"
				rounded
				onclick={() => handleNavigate(1)}
				aria-label="navigate next"
			/>

			<!-- image counter -->
			<span
				class="absolute bottom-2 right-2 rounded-full bg-gray-900/60 text-white text-xs font-medium px-2.5 py-0.5 backdrop-blur-sm"
			>
				{slideShowImages.activeIndex + 1} / {slideShowImages.medias.length}
			</span>
		{/if}
	</div>

	<!-- thumbnails -->
	<div class="w-full relative">
		<div class="w-full overflow-hidden grid grid-cols-5 gap-1.5">
			{#each displayMedias as picture, idx (idx)}
				<div class="inline-block">
					<div
						class="relative bg-white rounded-xl overflow-hidden cursor-pointer outline-hidden transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px {idx ===
						slideShowImages.activeIndex
							? 'ring-2 ring-brand-500 shadow-sm'
							: 'ring-1 ring-gray-200 hover:ring-gray-300'}"
						onmouseover={() => handleFocus(idx)}
						onfocus={() => handleFocus(idx)}
						tabindex="0"
						role="button"
						aria-label={`view image ${idx + 1}`}
					>
						<div class="relative w-full pb-[100%]">
							<picture>
								<source
									srcset={picture.url}
									type="image/webp"
									class="absolute h-full left-0 object-contain object-center right-0 w-full"
								/>
								<img
									src={picture.url}
									alt={picture.alt}
									class="absolute h-full left-0 object-contain object-center right-0 w-full"
									fetchpriority="high"
								/>
							</picture>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
