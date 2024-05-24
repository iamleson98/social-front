<script lang="ts">
	import { onMount } from 'svelte';

	export let images: string[] = [];

	let currentImage = 0;

	function next() {
		currentImage = (currentImage + 1) % images.length;
	}

	function prev() {
		currentImage = (currentImage - 1 + images.length) % images.length;
	}

	let interval: ReturnType<typeof setInterval>; // Sử dụng ReturnType

	onMount(() => {
		interval = setInterval(next, 3000); // Tự động chuyển ảnh mỗi 3 giây
		return () => clearInterval(interval);
	});
</script>

<div class="w-full overflow-hidden bg-white">
	<div class="flex w-full transition-transform duration-500 ease-in-out" style="transform: translateX({-currentImage * 100}%)">
		{#each images as image}
			<div class="min-w-full">
				<img src={image} alt="Slideshow Image" class="w-full" style="height: 400px;" />
			</div>
		{/each}
	</div>
	<div class="relative w-full mt-2">
		<div class="flex overflow-x-auto thumbnails-container">
			{#each images as image, index}
				<img
					src={image}
					alt="Thumbnail {index + 1}"
					class="h-20 w-20 mx-1 cursor-pointer rounded-md object-cover {currentImage === index ? 'border-2 border-blue-600 opacity-100' : 'opacity-60'}"
					on:click={() => (currentImage = index)}
				/>
			{/each}
		</div>
		<button class="absolute top-1/2 left-3 w-6 h-6 transform -translate-y-1/2 bg-white text-gray-500 border-none rounded-full flex items-center justify-center cursor-pointer" on:click={prev}>
			<img src="https://cdn-icons-png.flaticon.com/128/130/130882.png" alt="Previous" class="w-3 h-3">
		</button>
		<button class="absolute top-1/2 right-3 w-6 h-6 transform -translate-y-1/2 bg-white text-gray-500 border-none rounded-full flex items-center justify-center cursor-pointer" on:click={next}>
			<img src="https://cdn-icons-png.flaticon.com/128/130/130884.png" alt="Next" class="w-3 h-3">
		</button>
	</div>
</div>

<style>
	.thumbnails-container::-webkit-scrollbar {
		display: none;
	}
	.thumbnails-container {
		-ms-overflow-style: none;  /* Internet Explorer 10+ */
		scrollbar-width: none;  /* Firefox */
		white-space: nowrap; /* Ensure thumbnails stay on one line */
	}
	.thumbnails-container img {
		display: inline-block; /* Ensure images stay inline and don't wrap */
	}
</style>
