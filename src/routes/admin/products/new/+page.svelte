<script lang="ts">
	import { tClient } from '$i18n';
	import CategorySelector from '$lib/components/pages/products/category-selector.svelte';
	import DiscountByQuantity from '$lib/components/pages/products/discount-by-quantity.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/product-attribute-editor.svelte';
	import ProductDescriptionEditor from '$lib/components/pages/products/product-description-editor.svelte';
	import ProductDescription from '$lib/components/pages/products/product-description.svelte';
	import ProductPreorderEditor from '$lib/components/pages/products/product-preorder-editor.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/product-variant-creator.svelte';
	import { Input } from '$lib/components/ui/Input';
	import type { Category } from '$lib/gql/graphql';

	let now = new Date();

	let productCategory = $state<Category | null>(null);
</script>

<div class="m-auto rounded bg-white max-w-[800px] p-5 text-gray-600">
	<!-- product name -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.prdName')}</span>
		<Input placeholder={tClient('placeholders.enterPrdName')} size="md" />
		<div class="text-right">
			<span class="text-xs">{now.toDateString()}</span>
		</div>
	</div>

	<!-- category -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.prdCategory')}</span>
		<CategorySelector onCategorySelected={(cate) => (productCategory = cate)} />
	</div>

	<!-- description -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.prdDescription')}</span>
		<ProductDescription />
	</div>

	<!-- attributes -->
	{#if productCategory}
		<div class="mb-3">
			<span class="text-sm">{tClient('product.tabAttributes')}</span>
			<ProductAttributeEditor {productCategory} />
		</div>
	{/if}

	<!-- variants -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.variants')}</span>
		<ProductVariantCreator />
	</div>

	<!-- discount ranges -->
	<div class="mb-3">
		<span class="text-sm">{tClient('common.discountRange')}</span>
		<DiscountByQuantity />
	</div>

	<!-- packaging and delivery -->
	<div class="mb-3">
		<span class="text-sm">{tClient('common.packaging')}</span>
		<div class="bg-gray-50 rounded p-2">
			<PackagingAndDelivery />
		</div>
	</div>

	<!-- preorder -->
	<div class="mb-3">
		<span class="text-sm">{tClient('common.preorder')}</span>
		<div class="bg-gray-50 rounded p-2">
			<ProductPreorderEditor />
		</div>
	</div>

	<button class="btn btn-md w-full !bg-blue-500 text-white">Submit</button>
</div>
