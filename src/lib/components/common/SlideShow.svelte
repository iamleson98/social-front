<script lang="ts">
	export let images: string[] = [];

	let currentImage = 0;

	function next() {
		currentImage = (currentImage + 1) % images.length;
	}

	function prev() {
		currentImage = (currentImage - 1 + images.length) % images.length;
	}
</script>

<div class="w-full h-full overflow-hidden bg-white">
	<div
		class="flex w-full transition-transform duration-500 ease-in-out"
		style="transform: translateX({-currentImage * 100}%)"
	>
		{#each images as image}
			<div class="min-w-full">
				<img src={image} alt="Slideshow Image" class="w-full" />
			</div>
		{/each}
	</div>
	<div class="relative w-full mt-2">
		<div class="flex overflow-x-auto thumbnails-container">
			{#each images as image, index}
				<img
					src={image}
					alt="Thumbnail {index + 1}"
					class="h-20 w-20 tablet:h-14 tablet:w-14 mx-1 cursor-pointer rounded-md object-cover {currentImage ===
					index
						? 'border-[2px] border-custom-blue opacity-100'
						: 'opacity-60'}"
					on:click={() => (currentImage = index)}
				/>
			{/each}
		</div>
		<button
			class="absolute top-1/2 left-3 w-6 h-6 transform -translate-y-1/2 bg-white text-custom-text-color border-none rounded-full flex items-center justify-center cursor-pointer"
			on:click={prev}
		>
			<span class="icon-[system-uicons--chevron-left] w-5 h-5"></span>
		</button>
		<button
			class="absolute top-1/2 right-3 w-6 h-6 transform -translate-y-1/2 bg-white text-custom-text-color border-none rounded-full flex items-center justify-center cursor-pointer"
			on:click={next}
		>
			<span class="icon-[system-uicons--chevron-right] w-5 h-5"></span>
		</button>
	</div>
</div>

<style>
	.thumbnails-container::-webkit-scrollbar {
		display: none;
	}
	.thumbnails-container {
		-ms-overflow-style: none;
		scrollbar-width: none;
		white-space: nowrap;
	}
	.thumbnails-container img {
		display: inline-block;
	}
</style>
