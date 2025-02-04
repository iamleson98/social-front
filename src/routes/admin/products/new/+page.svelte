<script lang="ts">
	import { tranFunc } from '$i18n';
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditorjsComponent from '$lib/components/pages/products/new/product-description-editorjs-component.svelte';
	import ProductName from '$lib/components/pages/products/new/product-name.svelte';
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

	type ProductInputErrors = Partial<Record<keyof ProductCreateInput, string | undefined>>;

	let productCreateInput = $state<ProductCreateInput>({
		productType: '',
		attributes: [],
		rating: 5, // default to 5 as max
		chargeTaxes: true,
		slug: '',
		seo: {
			description: '',
			title: ''
		},
		name: '',
		metadata: [
			// NOTE: the order must be 'length', 'width', 'height', because child item binds values based on order
			{ key: 'length', value: '' },
			{ key: 'width', value: '' },
			{ key: 'height', value: '' }
		]
	});

	let promptInputError = $state(false);

	/** asynchronously calculate product input errors */
	let productInputErrors = $derived.by(() => {
		const errors: ProductInputErrors = {};
		const fieldRequiredMsg = $tranFunc('helpText.fieldRequired');

		if (!productCreateInput.category) errors.category = fieldRequiredMsg;
		if (!productCreateInput.description) errors.description = fieldRequiredMsg;
		if (!productCreateInput.description?.blocks?.length) errors.description = fieldRequiredMsg;

		return errors;
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);

	const handleSubmit = () => {
		promptInputError = true;

		console.log(productCreateInput);
	};
</script>

<div class="m-auto rounded-lg bg-white w-full p-5 text-gray-600">
	<ProductName bind:name={productCreateInput.name} />
	<CategorySelector
		bind:categoryID={productCreateInput.category}
		error={promptInputError ? productInputErrors.category : undefined}
	/>
	<ProductAttributeEditor
		categoryID={productCreateInput.category}
		bind:attributes={productCreateInput.attributes!}
	/>
	<ProductDescriptionEditorjsComponent
		bind:description={productCreateInput.description}
		error={promptInputError ? productInputErrors.description : undefined}
	/>
	<ProductVariantCreator bind:productVariantsInput />
	<ProductSeo
		productName={productCreateInput.name}
		bind:seoTitle={productCreateInput.seo!.title}
		bind:seoDescription={productCreateInput.seo!.description}
		bind:slug={productCreateInput.slug}
	/>
	<!-- <DiscountByQuantity /> -->
	<PackagingAndDelivery
		bind:metadata={productCreateInput.metadata}
		bind:weight={productCreateInput.weight}
	/>
	<!-- <ProductPreorderEditor /> -->

	<Button size="md" variant="filled" fullWidth onclick={handleSubmit}>Submit</Button>
</div>
