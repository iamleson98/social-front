<script lang="ts">
	import SelectableItem from '$lib/components/common/SelectableItem.svelte';
	// import SlideShow from '$lib/components/common/SlideShow.svelte';
	import { Heart } from '$lib/components/icons';
	import { formatMoney } from '$lib/utils/utils';
	import type { PageServerData } from './$types';
	import ProductMediaSlideShow from './ProductMediaSlideShow.svelte';
	import ProductPricing from './ProductPricing.svelte';

	export let data: PageServerData;

	// get list image from data
	let images = [
		// 'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		// 'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
		// 'https://www.wallpapertip.com/wmimgs/182-1823855_nh-phong-cnh-p-3d.jpg',
		// 'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg',
		// 'https://i.pinimg.com/originals/e7/9a/2e/e79a2e65f48f8f417c66cf5bdbd96d31.jpg',
		// 'https://inkythuatso.com/uploads/thumbnails/800/2022/05/48379320-2106918156275163-814891755752128512-n-13-10-17-37.jpg',
		// 'https://www.wallpapertip.com/wmimgs/182-1823855_nh-phong-cnh-p-3d.jpg',
		// 'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg',
		// 'https://shopthietke.com/wp-content/uploads/2023/10/O1CN01P8BzyF1Qu4sWnpCCz_2212790142035.jpg'
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
</script>

<svelte:head>
	<title>Product Detail</title>
</svelte:head>

<div class="m-auto max-w-6xl">
	<div class="flex flex-row tablet:flex-col flex-wrap gap-1">
		<div class="bg-white w-2/5 rounded tablet:w-full">
			<ProductMediaSlideShow />
		</div>

		<div class="bg-white w-3/5 rounded tablet:w-full">
			<ProductPricing productBasicInfo={{
				pricing
			}} />
		</div>		
	</div>

	<!-- product more details -->
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
