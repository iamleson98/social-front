<script lang="ts">
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import DiscountByQuantity from '$lib/components/pages/products/new/discount-by-quantity.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditor from '$lib/components/pages/products/new/product-description-editor.svelte';
	import ProductName from '$lib/components/pages/products/new/product-name.svelte';
	import ProductPreorderEditor from '$lib/components/pages/products/new/product-preorder-editor.svelte';
	import ProductSeo from '$lib/components/pages/products/new/product-seo.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/new/product-variant-creator.svelte';
	import { Button } from '$lib/components/ui';
	import type { ProductCreateInput, ProductVariantBulkCreateInput } from '$lib/gql/graphql';

	let productCreateInput = $state<ProductCreateInput>({
		productType: '',
		attributes: [],
		name: '',
		slug: '',
		rating: 5,
		chargeTaxes: true,
		seo: {
			description: '',
			title: ''
		}
	});

	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([
		{
			channelListings: [],
			attributes: [],
			stocks: [],
			weight: 0
		}
	]);

	const handlePrint = () => console.log(productCreateInput, variantsInputDetails);
</script>

<div class="m-auto rounded-lg bg-white max-w-5xl p-5 text-gray-600">
	<ProductName bind:name={productCreateInput.name as string} />
	<CategorySelector bind:categoryID={productCreateInput.category} />
	<ProductAttributeEditor
		categoryID={productCreateInput.category}
		bind:attributes={productCreateInput.attributes!}
	/>
	<ProductDescriptionEditor bind:description={productCreateInput.description} />
	<ProductVariantCreator bind:variantsInputDetails />
	<ProductSeo
		productName={productCreateInput.name as string}
		bind:seoTitle={productCreateInput.seo!.title as string}
		bind:seoDescription={productCreateInput.seo!.description as string}
		bind:slug={productCreateInput.slug as string}
	/>
	<DiscountByQuantity />
	<PackagingAndDelivery />
	<ProductPreorderEditor />

	<Button size="md" variant="filled" fullWidth onclick={handlePrint}>Submit</Button>
</div>
