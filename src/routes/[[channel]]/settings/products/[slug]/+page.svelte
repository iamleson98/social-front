<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { PRODUCT_DETAIL_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import ProductTypeSelector from '$lib/components/common/product-type-select/product-type.svelte';
	import CategorySelector from '$lib/components/pages/settings/products/new/category-selector.svelte';
	import CollectionsAndTax from '$lib/components/pages/settings/products/new/collections-and-tax.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/settings/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditorjsComponent from '$lib/components/pages/settings/products/new/product-description-editorjs-component.svelte';
	import ProductName from '$lib/components/pages/settings/products/new/product-name.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/new/product-seo.svelte';
	import Skeleton from '$lib/components/pages/settings/products/skeleton.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { ProductInput, Query, QueryProductArgs, ProductType } from '$lib/gql/graphql';
	import { onMount } from 'svelte';

	const NOW = new Date();

	const PRODUCT_DETAIL_STORE = operationStore<Pick<Query, 'product'>, QueryProductArgs>({
		kind: 'query',
		query: PRODUCT_DETAIL_QUERY,
		variables: {
			slug: page.params.slug,
		},
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let product = $state<ProductInput>({});
	let currentProductType = $state<ProductType>();
	let productInputError = $state<Record<keyof ProductInput, boolean>>({
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

		// productType: false,
		description: false,
		attributes: false,
		category: false,
		name: false,
		seo: false,
	});

	onMount(() => {
		return PRODUCT_DETAIL_STORE.subscribe((result) => {
			if (result.data?.product) {
				const {
					category,
					collections,
					description,
					externalReference,
					metadata,
					name,
					privateMetadata,
					rating,
					seoDescription,
					seoTitle,
					slug,
					taxClass,
					weight,
					productType,
					attributes,
				} = result.data.product;

				currentProductType = productType;
				product = {
					category: category?.id || undefined,
					collections: collections?.map((col) => col.id),
					description: description ? JSON.parse(description) : undefined,
					externalReference,
					metadata: metadata?.map((item) => ({ key: item.key, value: item.value })),
					name,
					privateMetadata: privateMetadata?.map((item) => ({ key: item.key, value: item.value })),
					rating,
					seo: {
						title: seoTitle,
						description: seoDescription,
					},
					slug,
					taxClass: taxClass?.id,
					weight,
				};
			}
		});
	});

	const handleSubmit = () => {};
</script>

<div class="m-auto rounded-lg bg-white w-full p-5 text-gray-600 border border-gray-200">
	{#if $PRODUCT_DETAIL_STORE.fetching}
		<Skeleton />
	{:else if $PRODUCT_DETAIL_STORE.error}
		<Alert variant="error" size="sm" bordered>{$PRODUCT_DETAIL_STORE.error.message}</Alert>
	{:else if product && currentProductType}
		<div class="text-right">
			<span class="text-xs">{NOW.toDateString()}</span>
		</div>

		<ProductName bind:name={product.name} bind:ok={productInputError.name} {loading} />
		<ProductTypeSelector value={currentProductType?.id} ok={true} loading={true} />
		<ProductAttributeEditor
			productTypeID={currentProductType?.id}
			attributes={product.attributes!}
			bind:ok={productInputError.attributes}
			{loading}
		/>
		<CategorySelector
			bind:categoryID={product.category}
			bind:ok={productInputError.category}
			{loading}
		/>
		<ProductDescriptionEditorjsComponent
			bind:description={product.description}
			bind:ok={productInputError.description}
		/>
		<CollectionsAndTax
			bind:collections={product.collections}
			bind:taxClassID={product.taxClass}
			{loading}
		/>
		<ProductSeo
			productName={product.name}
			bind:seo={product.seo!}
			bind:slug={product.slug}
			bind:ok={productInputError.seo}
			{loading}
		/>
		<PackagingAndDelivery bind:metadata={product.metadata} bind:weight={product.weight} {loading} />

		<Button
			size="md"
			variant="filled"
			fullWidth
			onclick={handleSubmit}
			{loading}
			disabled={!Object.values(productInputError).every(Boolean) || loading}
		>
			{$tranFunc('btn.update')}
		</Button>
	{/if}
</div>
