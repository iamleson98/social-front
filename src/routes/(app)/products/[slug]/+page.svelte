<script lang="ts">
	import SelectableItem from '$lib/components/common/SelectableItem.svelte';
	import SlideShow from '$lib/components/common/SlideShow.svelte';
	import type { PageData } from './$types';
	export let data: PageData;


	// get list image from data
	let images = [
		'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
		'https://img.freepik.com/free-photo/selective-focus-shot-speckled-wood-butterfly-little-flower_181624-25824.jpg?size=626&ext=jpg',
		'https://www.wallpapertip.com/wmimgs/182-1823855_nh-phong-cnh-p-3d.jpg',
		'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg',
		'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
		'https://img.freepik.com/free-photo/selective-focus-shot-speckled-wood-butterfly-little-flower_181624-25824.jpg?size=626&ext=jpg',
		'https://www.wallpapertip.com/wmimgs/182-1823855_nh-phong-cnh-p-3d.jpg',
		'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg',
		'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg'
	];

	//get list material from data
	let items = ['Wooden', 'Steel', 'Wooden', 'Steel'];

	//function select material
	let selectedItemIndex: number = -1;
	function handleSelectMaterial(index: number) {
		selectedItemIndex = index;
	}

	// get list size from data
	let sizes = ['XXL', 'XS', 'M'];

	//function select size
	let selectedSizeIndex: number = -1;
	function handleSelectSize(index: number) {
		selectedSizeIndex = index;
	}

	let quantity: number = 0;

	function increase() {
		quantity += 1;
	}

	function decrease() {
		if (quantity > 0) {
			quantity -= 1;
		}
	}

	let isVisible = false;

	function toggleVisibility() {
		isVisible = !isVisible;
	}

	let isVisibleMore = false;

	function toggleVisibilityMore() {
		isVisibleMore = !isVisibleMore;
	}
</script>

<svelte:head>
	<title>Detail Product</title>
</svelte:head>

<div class="w-full pt-10 bg-gray-100 pb-5">
	<div class="w-4/5 ml-auto mr-10 ">
		<div class="w-full flex flex-row">
			<div class="bg-white p-[20px] w-[500px] h-[595px] mr-2 mb-2 rounded-[5px]">
				<SlideShow {images} />
			</div>
			<div class="bg-white p-2 w-[560px] h-[595px] mb-2 rounded-[5px] pl-10 pt-5 pr-10">
				<p class="text-xl mb-10">Butterfly from amazom</p>

				<p class="text-xl text-red-500 font-bold mb-10">
					<!-- product price -->
					355.000 ₫ - 500.000 ₫
				</p>

				<div class="flex flex-row items-center">
					<p class="text-gray-500 font-thin mr-10">Deliver to:</p>
					<p class="text-gray-500 font-bold mr-3">
						<!-- address -->
						Trieu khuc, Thanh Tri
					</p>
					<button class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center"
						><img
							src="https://cdn-icons-png.flaticon.com/128/149/149060.png"
							alt=""
							class="w-3 h-3"
						/></button
					>
				</div>

				<div class="flex flex-row items-center mt-20">
					<p class="text-gray-500 font-thin w-1/6">Material:</p>
					<div class="item-container flex w-5/6 gap-2">
						{#each items as item, index}
							<SelectableItem
								content={item}
								selected={index === selectedItemIndex}
								on:select={() => handleSelectMaterial(index)}
							/>
						{/each}
					</div>
				</div>

				<div class="flex flex-row items-center mt-2">
					<p class="text-gray-500 font-thin w-1/6">Size:</p>
					<div class="item-container flex items-start gap-2 w-5/6">
						{#each sizes as sizes, index}
							<SelectableItem
								content={sizes}
								selected={index === selectedSizeIndex}
								on:select={() => handleSelectSize(index)}
							/>
						{/each}
					</div>
				</div>

				<div class="flex flex-row items-center mt-2 mb-3">
					<p class="text-gray-500 font-thin w-1/6">Quantity:</p>
					<div class="item-container flex items-start gap-2 w-5/6">
						<button
							on:click={decrease}
							class="w-6 h-6 flex items-center justify-center rounded-[2px] bg-gray-100 hover:bg-red-500 hover:text-white"
							>-</button
						>
						<span class="ml-3 mr-3">{quantity}</span>
						<button
							on:click={increase}
							class="w-6 h-6 flex items-center justify-center rounded-[2px] bg-gray-100 hover:bg-red-500 hover:text-white"
							>+</button
						>
						<p class="text-gray-500">8 items available</p>
					</div>
				</div>

				<button
					class="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-10 disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:hover:text-gray-500"
				>
				<span class="icon-[system-uicons--cart] w-6 h-6" style="color: white;"></span>
					Add to Cart
				</button>

				<div class="flex gap-2 w-full mt-20 justify-center">
					<button
						class="flex items-center bg-gray-200 text-gray-500 px-6 py-1 rounded hover:bg-gray-300"
					>
						365
						<span class="icon-[system-uicons--heart] w-6 h-6" style="color: #718096;"></span>
					</button>
					<button
						class="flex items-center bg-gray-200 text-gray-500 px-6 py-1 rounded hover:bg-gray-300"
					>
						365
						<span class="icon-[system-uicons--bookmark] w-6 h-6" style="color: #718096;"></span>
					</button>

					<div class="relative inline-block">
						<div
							class="absolute flex w-full p-2 justify-center items-center gap-2 bottom-full bg-white mb-2 rounded shadow-md"
							class:hidden={!isVisible}
						>
							<button>
								<img
									src="https://cdn-icons-png.flaticon.com/128/733/733547.png"
									alt=""
									class="w-5 h-5"
								/>
							</button>
							<button>
								<img
									src="https://cdn-icons-png.flaticon.com/128/3621/3621448.png"
									alt=""
									class="w-5 h-5"
								/>
							</button>
							<button>
								<img
									src="https://cdn-icons-png.flaticon.com/128/3256/3256013.png"
									alt=""
									class="w-5 h-5"
								/>
							</button>
						</div>

						<button
							on:click={toggleVisibility}
							class="flex items-center bg-gray-200 text-gray-500 px-6 py-1 rounded hover:bg-gray-300"
						>
							365
							<svg
								class="w-6 h-6 text-gray-500 dark:text-white ml-1"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								fill="none"
								viewBox="0 0 24 24"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-width="2"
									d="M7.926 10.898 15 7.727m-7.074 5.39L15 16.29M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm12 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0-11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
								/>
							</svg>
						</button>
					</div>

					<div class="relative inline-block">
						<div
							class="absolute flex w-full p-2 justify-center items-center gap-2 bottom-full bg-white mb-2 rounded shadow-md"
							class:hidden={!isVisibleMore}
						>
							<button>
								<img
									src="https://cdn-icons-png.flaticon.com/128/12135/12135637.png"
									alt=""
									class="w-5 h-5"
								/>
							</button>
						</div>

						<button
							on:click={toggleVisibilityMore}
							class="flex items-center bg-gray-200 px-6 py-1 rounded hover:bg-gray-300"
						>
							<span class="icon-[system-uicons--menu-horizontal] w-6 h-6" style="color: #718096;"></span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white w-full rounded-[5px] p-5 pl-20 pr-20 mb-20">
			<p class="text-xl text-black-500 font-bold">Information</p>
			<div class="flex">
				<!-- tag product type -->
				
			</div>
			<div>
				
				<!-- description -->
			</div>
		</div>
	</div>
</div>