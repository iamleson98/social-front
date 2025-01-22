<script lang="ts">
	import 'cally'; // for datetime component
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
	import type { ProductCreateInput } from '$lib/gql/graphql';

	let now = new Date();

	let productName = $state();

	let productCreateInput = $state<ProductCreateInput>({
		productType: '',
		attributes: []
	});

	const handlePrint = () => console.log(productCreateInput.category);
</script>

<div class="m-auto rounded-lg bg-white max-w-5xl p-5 text-gray-600">
	<!-- product name -->
	<div class="mb-3">
		<span class="text-sm">{tClient('product.prdName')}</span>
		<Input placeholder={tClient('placeholders.enterPrdName')} size="md" bind:value={productName} />
		<div class="text-right">
			<span class="text-xs">{now.toDateString()}</span>
		</div>
	</div>

	<CategorySelector bind:categoryID={productCreateInput.category} />
	<ProductAttributeEditor
		categoryID={productCreateInput.category}
		bind:attributes={productCreateInput.attributes!}
	/>
	<ProductDescriptionEditor />
	<ProductVariantCreator />
	<DiscountByQuantity />
	<PackagingAndDelivery />
	<ProductPreorderEditor />

	<Button size="md" variant="filled" fullWidth onclick={handlePrint}>Submit</Button>
</div>
