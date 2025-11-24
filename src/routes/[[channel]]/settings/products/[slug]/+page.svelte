<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { PRODUCT_DELETE_MUTATION, PRODUCT_DETAIL_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import {
		ActionBar,
		GeneralMetadataEditor,
		type GeneralMetadataEditorRef,
	} from '$lib/components/pages/settings/common';
	import CategorySelector from '$lib/components/pages/settings/products/new/category-selector.svelte';
	import ChannelsSelector from '$lib/components/pages/settings/products/new/channels-selector.svelte';
	import CollectionsAndTax from '$lib/components/pages/settings/products/new/collections-and-tax.svelte';
	import GeneralInformation from '$lib/components/pages/settings/products/new/general-information.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/new/packaging-and-delivery.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/new/product-seo.svelte';
	import { ProductPrivateMetadataVariantAttributeUsedKey } from '$lib/components/pages/settings/products/new/utils';
	import VariantsEditor from '$lib/components/pages/settings/products/new/variants-editor.svelte';
	import Skeleton from '$lib/components/pages/settings/products/skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		ProductInput,
		Query,
		QueryProductArgs,
		ProductType,
		Mutation,
		MutationProductDeleteArgs,
		ProductChannelListingUpdateInput,
		ProductVariantBulkUpdateInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const ProductDetailStore = operationStore<Pick<Query, 'product'>, QueryProductArgs>({
		query: PRODUCT_DETAIL_QUERY,
		variables: {
			slug: page.params.slug,
		},
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let product = $state<ProductInput>({
		name: '',
		description: '',
		attributes: [],
		category: '',
		seo: {},
		slug: '',
		metadata: [],
		privateMetadata: [],
		collections: [],
		rating: 5,
		chargeTaxes: true,
		weight: 0,
	});
	let currentProductType = $state<ProductType>();
	let productTypeRequiresShipping = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();
	let productMediasOk = $state(true);
	let productMedias = $state.raw<MediaObject[]>([]);
	let productInputError = $state({
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
		channelListing: true,
	});
	let channelListingUpdateInput = $state.raw<ProductChannelListingUpdateInput>({});
	// let productVariantBulkUpdateInput = $state<ProductVariantBulkUpdateInput>({})

	onMount(() => {
		return ProductDetailStore.subscribe((result) => {
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
					media,
				} = result.data.product;

				currentProductType = productType;
				productTypeRequiresShipping = productType.isShippingRequired;
				product = {
					category: category?.id || undefined,
					collections: collections?.map((col) => col.id),
					description: description ? JSON.parse(description) : undefined,
					externalReference,
					metadata: metadata?.map((item) => ({ key: item.key, value: item.value })),
					name,
					privateMetadata:
						privateMetadata?.map((item) => ({ key: item.key, value: item.value })) || [],
					rating,
					seo: {
						title: seoTitle,
						description: seoDescription,
					},
					slug,
					taxClass: taxClass?.id,
					weight,
				};

				if (media?.length) {
					productMedias = media.map<MediaObject>((item) => ({
						alt: item.alt,
						url: item.url,
						type: item.type,
					}));
				}
			}
		});
	});

	const handleSubmit = async () => {
		const hasErr = await metaRef?.handleUpdate($ProductDetailStore.data?.product?.id);
		if (hasErr) return;
	};

	const handleDelete = () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'productDelete'>,
					MutationProductDeleteArgs
				>(PRODUCT_DELETE_MUTATION, {
					id: page.params.slug!,
				});
				loading = false;

				if (!checkIfGraphqlResultHasError(result, 'productDelete', $CommonState.DeleteSuccess))
					await goto(AppRoute.SETTINGS_PRODUCTS());
			},
		});
	};
</script>

{#if $ProductDetailStore.fetching}
	<Skeleton />
{:else if $ProductDetailStore.error}
	<Alert variant="error" size="sm" bordered>{$ProductDetailStore.error.message}</Alert>
{:else if $ProductDetailStore.data?.product && currentProductType}
	{@const { metadata, privateMetadata, id, channelListings } = $ProductDetailStore.data.product}
	<div class="space-y-2">
		<GeneralInformation
			bind:name={product.name!}
			bind:productType={currentProductType.id}
			bind:description={product.description}
			bind:attributes={product.attributes!}
			disabled={loading}
			isCreatePage
			bind:productTypeRequiresShipping
		/>
		<CategorySelector
			bind:categoryID={product.category!}
			bind:formOk={productInputError.category}
			{loading}
		/>
		<FileInputContainer
			accept="image/*"
			max={9}
			class={SitenameCommonClassName}
			bind:medias={productMedias}
			label={$tranFunc('common.pic')}
			bind:formOk={productMediasOk}
			disabled={loading}
			required
		/>
		<ProductSeo
			productName={product.name}
			bind:seo={product.seo!}
			bind:slug={product.slug}
			bind:formOk={productInputError.seo}
			{loading}
		/>
		<div class={SitenameCommonClassName}>
			<ChannelsSelector
				bind:channelListingUpdateInput
				channelListings={channelListings || []}
				ok={productInputError.channelListing}
				{loading}
			/>
			<VariantsEditor
				{loading}
				productTypeId={currentProductType.id}
				{productMedias}
				channelsListing={channelListingUpdateInput}
				productVariantsInput={[]}
				bind:privateMetadata={product.privateMetadata!}
			/>
		</div>
		<CollectionsAndTax
			bind:collections={product.collections}
			bind:taxClassID={product.taxClass}
			{loading}
		/>
		<GeneralMetadataEditor
			bind:this={metaRef}
			disabled={loading}
			{metadata}
			{privateMetadata}
			objectId={id}
			privateMetadataKeysToHide={[ProductPrivateMetadataVariantAttributeUsedKey]}
		/>
		{#if productTypeRequiresShipping}
			<PackagingAndDelivery
				bind:metadata={product.metadata}
				bind:weight={product.weight}
				{loading}
			/>
		{/if}
	</div>

	<ActionBar
		disabled={loading}
		onUpdateClick={handleSubmit}
		backButtonUrl={AppRoute.SETTINGS_PRODUCTS()}
		onDeleteClick={handleDelete}
	/>
{/if}
