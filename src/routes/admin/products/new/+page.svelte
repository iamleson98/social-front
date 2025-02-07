<script lang="ts">
	import { CREATE_PRODUCT_MUTATION } from '$lib/api/admin/product';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import ProductType from '$lib/components/common/product-type-select/product-type.svelte';
	import CategorySelector from '$lib/components/pages/products/new/category-selector.svelte';
	import CollectionAndTax from '$lib/components/pages/products/new/collections-and-tax.svelte';
	import PackagingAndDelivery from '$lib/components/pages/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditorjsComponent from '$lib/components/pages/products/new/product-description-editorjs-component.svelte';
	import ProductName from '$lib/components/pages/products/new/product-name.svelte';
	import ProductSeo from '$lib/components/pages/products/new/product-seo.svelte';
	import ProductVariantCreator from '$lib/components/pages/products/new/product-variant-creator.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		Mutation,
		MutationProductCreateArgs,
		ProductCreateInput,
		ProductVariantBulkCreateInput
	} from '$lib/gql/graphql';

	const NOW = new Date();

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
		externalReference: true, // not supported yet
		privateMetadata: true, // not supported yet
		collections: true, // this field is optional
		chargeTaxes: true, // not supported yet
		metadata: true,
		taxClass: true, // optional
		taxCode: true, // not supported yet
		rating: true, // default set to 5 (highest)
		weight: true,
		slug: true,

		productType: false,
		description: false,
		attributes: false,
		category: false,
		name: false,
		seo: false
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);
	let productCreateMutationStore =
		$state<OperationResultStore<Pick<Mutation, 'productCreate'>, MutationProductCreateArgs>>();

	const handleSubmit = () => {

		const submitData: ProductCreateInput = {
			...productCreateInput,
			description: productCreateInput.description ? JSON.stringify(productCreateInput.description) : null
		};
		productCreateMutationStore = operationStore<
			Pick<Mutation, 'productCreate'>,
			MutationProductCreateArgs
		>({
			kind: 'mutation',
			query: CREATE_PRODUCT_MUTATION,
			variables: {
				input: submitData
			},
			requestPolicy: 'network-only'
		});
	};
</script>

<div class="m-auto rounded-lg bg-white w-full p-5 text-gray-600">
	<div class="text-right">
		<span class="text-xs">{NOW.toDateString()}</span>
	</div>
	<ProductName bind:name={productCreateInput.name} bind:ok={productInputError.name} />
	<ProductType
		bind:value={productCreateInput.productType}
		bind:ok={productInputError.productType}
		class="mb-3"
	/>
	<ProductAttributeEditor
		productTypeID={productCreateInput.productType}
		bind:attributes={productCreateInput.attributes!}
		bind:ok={productInputError.attributes}
	/>
	<CategorySelector
		bind:categoryID={productCreateInput.category}
		bind:ok={productInputError.category}
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

	{#if $productCreateMutationStore?.error}
		<Alert variant="error" size="sm" class="mb-3" bordered
			>{$productCreateMutationStore.error.message}</Alert
		>
	{:else if $productCreateMutationStore?.data?.productCreate?.errors.length}
		<Alert variant="error" size="sm" class="mb-3" bordered
			>{$productCreateMutationStore.data.productCreate.errors[0].message}</Alert
		>
	{:else if $productCreateMutationStore?.data?.productCreate?.product}
		<Alert variant="success" size="sm" class="mb-3" bordered>Product created successfully</Alert>
	{/if}

	<Button
		size="md"
		variant="filled"
		fullWidth
		onclick={handleSubmit}
		loading={$productCreateMutationStore?.fetching}
		disabled={!Object.values(productInputError).every(Boolean) ||
			$productCreateMutationStore?.fetching}
	>
		Submit
	</Button>
</div>
