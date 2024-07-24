<script lang="ts">
	import SelectableItem from '$lib/components/common/selectable-item.svelte';
	import { Heart, Icon, MingcuteHome } from '$lib/components/icons';
	import { formatMoney } from '$lib/utils/utils';
	import type { PageServerData } from './$types';
	import ProductMediaSlideShow from './product-slide-show-pannel.svelte';
	import ProductPricingPanel from './product-pricing-pannel.svelte';
	import { ProductMediaType, type Product } from '$lib/gql/graphql';
	import ProductList from '$lib/components/common/product-list.svelte';
	import ProductDetailPanel from './product-detail-pannel.svelte';

	export let data: PageServerData;

	const { media, ...productInformation } = data.data as Product;

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

<div class="m-auto max-w-6xl">
	<!-- breadcrumb -->
	<div class="breadcrumbs text-sm">
  <ul>
    <li >
      <a href="/" class="text-blue-600">
				<Icon icon={MingcuteHome} class="mr-1" />
        Home
      </a>
    </li>
    <li>
      <a href='/'>
        Documents
      </a>
    </li>
    <li>
      <span>
        Pillow
      </span>
    </li>
  </ul>
</div>

	<div class="flex flex-row tablet:flex-col tablet:flex-wrap gap-1 w-full mb-1">
		<!-- slide show section -->
		<div class="w-2/5 rounded tablet:w-full flex flex-col gap-1">
			<ProductMediaSlideShow medias={media || []} />
		</div>

		<!-- product basic prices -->
		<div class="bg-white w-3/5 rounded tablet:w-full p-4">
			<ProductPricingPanel {productInformation} />
		</div>
	</div>

	<!-- product more details -->
	<div class="bg-white w-full rounded p-4">
		<ProductDetailPanel selectedAttributes={productInformation.attributes} />
	</div>
</div>
