<script lang="ts">
	import { tClient } from '$i18n';
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import DiscountByQuantity from '$lib/components/pages/products/new/discount-by-quantity.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditor from '$lib/components/pages/products/new/product-description-editor.svelte';
	import ProductPreorderEditor from '$lib/components/pages/products/new/product-preorder-editor.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/new/product-variant-creator.svelte';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';

	let now = new Date();
</script>

<div class="m-auto rounded-sm bg-white max-w-[800px] p-5 text-gray-600">
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
		<CategorySelector />
	</div>

	<!-- attributes -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.tabAttributes')}</span>
		<ProductAttributeEditor />
	</div>

	<!-- description -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.prdDescription')}</span>
		<ProductDescriptionEditor />
	</div>

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
		<PackagingAndDelivery />
	</div>

	<!-- preorder -->
	<div class="mb-3">
		<span class="text-sm">{tClient('common.preorder')}</span>
		<ProductPreorderEditor />
	</div>

	<!-- <button class="btn btn-md w-full bg-blue-500! text-white">Submit</button> -->
	<Button size="md" variant="filled" fullWidth>Submit</Button>
</div>
