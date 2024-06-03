<script lang="ts">
	import ButtonDetailProduct from '$lib/components/common/ButtonDetailProduct.svelte';
	import SelectableItem from '$lib/components/common/SelectableItem.svelte';
	import SlideShow from '$lib/components/common/SlideShow.svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	// get list image from data
	let images = [
		'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
		'https://www.wallpapertip.com/wmimgs/182-1823855_nh-phong-cnh-p-3d.jpg',
		'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg',
		'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
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
	<div class="w-4/5 ml-auto mr-10">
		<div class="w-full flex flex-row mobile-l:flex-col">
			<div class="bg-white p-5 w-2/5 h-82 mr-3 mb-3 rounded-[5px] mobile-l:w-full">
				<SlideShow {images} />
			</div>
			<div
				class=" flex-col justify-between bg-white p-1 w-3/5 mb-3 rounded-[5px] pl-10 pt-5 pr-10 pb-3 mobile-l:w-full"
			>
				<div>
					<p class="text-3xl text-black-400 mb-10 laptop:mb-3 tablet:mb-1 laptop:text-sm">
						The butterfly from amazom
					</p>

					<p class="text-xl text-red-400 font-bold mb-5 laptop:text-sm laptop:mb-2 tablet:text-xs">
						<!-- product price -->
						355.000 ₫ - 500.000 ₫
					</p>

					<div class="flex flex-row items-center tablet:text-xs">
						<p class="text-gray-400 font-thin w-1/5">Deliver to</p>
						<p class="text-gray-400 mr-3">
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
				</div>

				<div>
					<div class="flex flex-row items-center mt-20 desktop:mt-3 tablet:text-xs">
						<p class="text-gray-400 font-thin w-1/5">Material</p>
						<div class="item-container flex w-3/5 gap-2">
							{#each items as item, index}
								<SelectableItem
									content={item}
									selected={index === selectedItemIndex}
									on:select={() => handleSelectMaterial(index)}
								/>
							{/each}
						</div>
					</div>

					<div class="flex flex-row items-center mt-2 tablet:text-xs">
						<p class="text-gray-400 font-thin w-1/5">Size</p>
						<div class="item-container flex items-start gap-2 w-3/5 table:text-m">
							{#each sizes as sizes, index}
								<SelectableItem
									content={sizes}
									selected={index === selectedSizeIndex}
									on:select={() => handleSelectSize(index)}
								/>
							{/each}
						</div>
					</div>

					<div class="flex flex-row items-center mt-5 mb-3 tablet:text-xs tablet:mt-2">
						<p class="text-gray-400 font-thin w-1/5">Quantity</p>
						<div class="item-container flex items-start gap-2 w-4/5">
							<button
								on:click={decrease}
								class="w-6 h-6 flex items-center justify-center rounded text-gray-400 bg-gray-200 hover:bg-red-400 hover:text-white"
								>-</button
							>
							<span class="ml-3 mr-3 text-gray-400">{quantity}</span>
							<button
								on:click={increase}
								class="w-6 h-6 flex items-center justify-center rounded text-gray-400 bg-gray-200 hover:bg-red-400 hover:text-white"
								>+</button
							>
							<p class="text-gray-400">8 items available</p>
						</div>
					</div>

					<button
						class="flex items-center bg-red-400 text-white px-4 py-2 rounded desktop:mt-3 tablet:text-xs hover:bg-red-500 mt-10 disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 disabled:hover:text-gray-500"
					>
						<span
							class="icon-[system-uicons--cart] w-6 h-6 mr-1 tablet:w-3 tablet:h-3"
							style="color: white;"
						></span>
						<p class="tablet:text-xs">Add to Cart</p>
					</button>
				</div>

				<div
					class="flex flex-row gap-2 w-4/6 ml-auto mr-auto mt-20 justify-center laptop:mt-3 laptop:text-xs"
				>
					<ButtonDetailProduct text="365" icon="icon-[system-uicons--heart]" on:click={() => {}} />
					<ButtonDetailProduct
						text="365"
						icon="icon-[system-uicons--bookmark]"
						on:click={() => {}}
					/>
					<div class="relative w-full sm:w-auto">
						<ButtonDetailProduct
							text="365"
							icon=""
							isToggle={true}
							{isVisible}
							toggleDropdown={toggleVisibility}
							dropdownItems={[
								{ src: 'https://cdn-icons-png.flaticon.com/128/733/733547.png', alt: 'icon1' },
								{ src: 'https://cdn-icons-png.flaticon.com/128/3621/3621448.png', alt: 'icon2' },
								{ src: 'https://cdn-icons-png.flaticon.com/128/3256/3256013.png', alt: 'icon3' }
							]}
						/>
					</div>
					<div class="relative w-full sm:w-auto">
						<ButtonDetailProduct
							text=""
							icon="icon-[system-uicons--menu-horizontal]"
							isToggle={true}
							isVisible={isVisibleMore}
							toggleDropdown={toggleVisibilityMore}
							dropdownItems={[
								{ src: 'https://cdn-icons-png.flaticon.com/128/12135/12135637.png', alt: 'icon4' }
							]}
						/>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-white w-full rounded p-5 pl-20 pr-20 mb-20">
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
