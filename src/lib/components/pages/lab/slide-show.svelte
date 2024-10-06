<script lang="ts">
	type Picture = {
		src: string;
		alt: string;
		id: number;
	};

	const allPictures: Picture[] = [
		{
			id: 1,
			src: 'https://th-thumbnailer.cdn-si-edu.com/bgmkh2ypz03IkiRR50I-UMaqUQc=/1000x750/filters:no_upscale():focal(1061x707:1062x708)/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer_public/55/95/55958815-3a8a-4032-ac7a-ff8c8ec8898a/gettyimages-1067956982.jpg',
			alt: 'cat1'
		},
		{
			id: 2,
			src: 'https://static.scientificamerican.com/sciam/cache/file/2AE14CDD-1265-470C-9B15F49024186C10_source.jpg?w=1200',
			alt: 'cat2'
		},
		{
			id: 3,
			src: 'https://static.vecteezy.com/system/resources/thumbnails/024/646/930/small_2x/ai-generated-stray-cat-in-danger-background-animal-background-photo.jpg',
			alt: 'cat3'
		},
		{
			id: 4,
			src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKOOpLy92UjzQxq8NCxgxOQJbj_YVdfHO_g&s',
			alt: 'cat4'
		},
		{
			id: 5,
			src: 'https://hips.hearstapps.com/hmg-prod/images/grey-cat-playing-royalty-free-image-1721750423.jpg?crop=0.752xw:1.00xh;0.178xw,0&resize=640:*',
			alt: 'cat5'
		},
		{
			id: 6,
			src: 'https://d2zp5xs5cp8zlg.cloudfront.net/image-79322-800.jpg',
			alt: 'cat5'
		},
		{
			id: 7,
			src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUL1_1NLwMJQ7iJHbwI1Qdhph8FTrj3Y7TKw&s',
			alt: 'cat5'
		},
		{
			id: 8,
			src: 'https://cdn.psychologytoday.com/sites/default/files/styles/article-inline-half-caption/public/field_blog_entry_images/2021-12/img_1570.jpg?itok=4nWOikbM',
			alt: 'cat5'
		}

		// Other pictures...
	];

	let slicing = $state.raw([0, Math.min(5, allPictures.length)]);
	let activeIndex = $state(0);

	const handleNavigateClick = (dir: 1 | -1) => async () => {
		const nextIndex = activeIndex + dir;
		if (nextIndex < 0) {
			if (slicing[0] === 0) return;
			slicing = slicing.map((item) => item - 1);
			return;
		}
		if (nextIndex === slicing[1] - slicing[0]) {
			if (slicing[1] === allPictures.length) return;
			slicing = slicing.map((item) => item + 1);
			return;
		}
		activeIndex = nextIndex;
	};

	const handleMouseOver = (idx: number) => {
		if (idx !== activeIndex) {
			activeIndex = idx;
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') handleNavigateClick(-1)();
		else if (e.key === 'ArrowRight') handleNavigateClick(1)();
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="max-w-lg mt-16">
	<div class="w-full bg-gray-100 overflow-hidden">
		{#each allPictures.slice(...slicing) as picture, idx (picture.id)}
			<div class="w-1/5 p-1 inline-block box-border">
				<div
					class="relative bg-white rounded-md overflow-hidden cursor-pointer outline-none"
					onmouseover={() => handleMouseOver(idx)}
					tabindex="0"
					onfocus={() => handleMouseOver(idx)}
					role="button"
				>
					<div class="relative w-full pb-[100%]">
						<img
							src={picture.src}
							alt={picture.alt}
							loading="lazy"
							class="absolute h-full left-0 object-contain object-center right-0 w-full"
						/>
					</div>

					<div
						class={`absolute left-0 top-0 bottom-0 right-0 rounded-md ${idx === activeIndex ? 'border-blue-500 border-2' : ''}`}
					></div>
				</div>
			</div>
		{/each}
	</div>
</div>

<div class="flex items-center justify-between mt-[100px]">
	<button onclick={handleNavigateClick(-1)}>Left</button>
	<button onclick={handleNavigateClick(1)}>Right</button>
</div>
