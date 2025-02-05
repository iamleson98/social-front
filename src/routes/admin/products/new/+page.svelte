<script lang="ts">
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import CollectionAndTax from '$lib/components/pages/products/new/collections-and-tax.svelte';
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
			{ key: 'length', value: '0' },
			{ key: 'width', value: '0' },
			{ key: 'height', value: '0' }
		],
		collections: []
	});

	let productInputError = $state<Record<keyof ProductCreateInput, boolean>>({
		attributes: false,
		category: false,
		chargeTaxes: true, // not supported yet
		collections: true, // this field is optional
		description: false,
		externalReference: false,
		metadata: true, // not supported yet
		name: false,
		privateMetadata: true, // not supported yet
		productType: false,
		rating: true, // default set to 5 (highest)
		seo: false,
		slug: false,
		taxClass: true, // optional
		taxCode: true, // not supported yet
		weight: false
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);

	const handleSubmit = () => {
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
	<CollectionAndTax
		bind:collections={productCreateInput.collections}
		bind:taxClassID={productCreateInput.taxClass}
	/>
	<PackagingAndDelivery
		bind:metadata={productCreateInput.metadata}
		bind:weight={productCreateInput.weight}
	/>

	<Button
		size="md"
		variant="filled"
		fullWidth
		onclick={handleSubmit}
		disabled={!Object.values(productInputError).every(Boolean)}>Submit</Button
	>
</div>
