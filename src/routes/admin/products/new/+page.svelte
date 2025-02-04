<script lang="ts">
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditorjsComponent from '$lib/components/pages/products/new/product-description-editorjs-component.svelte';
	import ProductName from '$lib/components/pages/products/new/product-name.svelte';
	import ProductSeo from '$lib/components/pages/products/new/product-seo.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/new/product-variant-creator.svelte';
	import { Button } from '$lib/components/ui';
	import type { ProductCreateInput, ProductVariantBulkCreateInput } from '$lib/gql/graphql';

	let productCreateInput = $state<ProductCreateInput>({
		productType: '',
		attributes: [],
		rating: 5, // default to 5 as max
		chargeTaxes: true,
		slug: '',
		seo: {},
		name: '',
		metadata: [
			// NOTE: the order must be 'length', 'width', 'height', because child item binds values based on order
			{ key: 'length', value: '' },
			{ key: 'width', value: '' },
			{ key: 'height', value: '' }
		]
	});

	let productInputError = $state<Record<keyof ProductCreateInput, boolean>>({
		attributes: false,
		category: false,
		chargeTaxes: false,
		collections: false,
		description: false,
		externalReference: false,
		metadata: false,
		name: false,
		privateMetadata: false,
		productType: false,
		rating: false,
		seo: false,
		slug: false,
		taxClass: false,
		taxCode: false,
		weight: false
	});

	let promptInputError = $state(false);

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);

	const handleSubmit = () => {
		promptInputError = true;

		console.log(productCreateInput);
	};
</script>

<div class="m-auto rounded-lg bg-white w-full p-5 text-gray-600">
	<ProductName bind:name={productCreateInput.name} bind:ok={productInputError.name} />
	<CategorySelector
		bind:categoryID={productCreateInput.category}
		bind:ok={productInputError.category}
	/>
	<ProductAttributeEditor
		categoryID={productCreateInput.category}
		bind:attributes={productCreateInput.attributes!}
		bind:ok={productInputError.attributes}
	/>
	<ProductDescriptionEditorjsComponent
		bind:description={productCreateInput.description}
		bind:ok={productInputError.description}
	/>
	<ProductVariantCreator bind:productVariantsInput />
	<ProductSeo
		productName={productCreateInput.name}
		bind:seo={productCreateInput.seo}
		bind:slug={productCreateInput.slug}
		bind:ok={productInputError.seo}
	/>
	<!-- <DiscountByQuantity /> -->
	<PackagingAndDelivery
		bind:metadata={productCreateInput.metadata}
		bind:weight={productCreateInput.weight}
	/>
	<!-- <ProductPreorderEditor /> -->

	<Button size="md" variant="filled" fullWidth onclick={handleSubmit}>Submit</Button>
</div>
