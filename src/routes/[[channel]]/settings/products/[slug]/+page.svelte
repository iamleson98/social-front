<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PRODUCT_DELETE_MUTATION, PRODUCT_DETAIL_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import {
		ActionBar,
		GeneralMetadataEditor,
		type GeneralMetadataEditorRef,
	} from '$lib/components/pages/settings/common';
	import GeneralInformation from '$lib/components/pages/settings/products/new/general-information.svelte';
	import CategorySelector from '$lib/components/pages/settings/products/new/category-selector.svelte';
	import CollectionsAndTax from '$lib/components/pages/settings/products/new/collections-and-tax.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/new/packaging-and-delivery.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/new/product-seo.svelte';
	import Skeleton from '$lib/components/pages/settings/products/skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import type {
		ProductInput,
		Query,
		QueryProductArgs,
		ProductType,
		Mutation,
		MutationProductDeleteArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import { tranFunc } from '$i18n';
	import type { MediaObject } from '$lib/utils/types';
	import ChannelsSelector from '$lib/components/pages/settings/products/new/channels-selector.svelte';
	import VariantsEditor from '$lib/components/pages/settings/products/new/variants-editor.svelte';

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
	let metaRef = $state<GeneralMetadataEditorRef>();
	let productMediasOk = $state(true);
	let productMedias = $state.raw<MediaObject[]>([]);
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
					attributes,
					media,
					channelListings,
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

	const handleSubmit = () => {};

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
	{@const { metadata, privateMetadata, id } = $ProductDetailStore.data.product}
	<div class="space-y-2">
		<GeneralInformation
			bind:name={product.name!}
			bind:productType={currentProductType.id}
			bind:description={product.description}
			bind:attributes={product.attributes!}
			disabled={loading}
			isCreatePage
		/>
		<CategorySelector
			bind:categoryID={product.category}
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
		<!-- <div class={SitenameCommonClassName}>
			<ChannelsSelector bind:channelListingUpdateInput ok={channelListingUpdateInputOk} {loading} />
			<VariantsEditor
				{loading}
				productTypeId={currentProductType.id}
				{productMedias}
				channelsListing={channelListingUpdateInput}
				bind:productVariantsInput
			/>
		</div> -->
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
		/>
		<PackagingAndDelivery bind:metadata={product.metadata} bind:weight={product.weight} {loading} />
	</div>

	<ActionBar
		disabled={loading}
		onUpdateClick={handleSubmit}
		backButtonUrl={AppRoute.SETTINGS_PRODUCTS()}
		onDeleteClick={handleDelete}
	/>
{/if}
