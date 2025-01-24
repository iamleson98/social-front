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
	import { array, boolean, object, string } from 'zod';

	const ProductAttributeSchema = object({
		boolean: boolean()
	});

	const ProductInputSchema = object({
		productType: string().nonempty(),
		attributes: array(ProductAttributeSchema)
	});

	let productCreateInput = $state<ProductCreateInput>({
		productType: '',
		attributes: [],
		rating: 5, // default to 5 as max
		chargeTaxes: true,
		slug: '',
		seo: {
			description: '',
			title: ''
		}
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);

	const handlePrint = () => console.log($state.snapshot(productCreateInput));
</script>

<div class="m-auto rounded-lg bg-white max-w-5xl p-5 text-gray-600">
	<ProductName bind:name={productCreateInput.name} />
	<CategorySelector bind:categoryID={productCreateInput.category} />
	<ProductAttributeEditor
		categoryID={productCreateInput.category}
		bind:attributes={productCreateInput.attributes!}
	/>
	<ProductDescriptionEditor bind:description={productCreateInput.description} />
	<ProductVariantCreator bind:productVariantsInput />
	<ProductSeo
		productName={productCreateInput.name}
		bind:seoTitle={productCreateInput.seo!.title}
		bind:seoDescription={productCreateInput.seo!.description}
		bind:slug={productCreateInput.slug}
	/>
	<DiscountByQuantity />
	<PackagingAndDelivery />
	<ProductPreorderEditor />

	<Button size="md" variant="filled" fullWidth onclick={handlePrint}>Submit</Button>
</div>
