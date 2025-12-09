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
	import VariantsEditEditor, {
		ChannelListingCurrentKey,
		ChannelListingExistingKey,
		StockCurrentKey,
		StockExistingKey,
	} from '$lib/components/pages/settings/products/new/variants-edit-editor.svelte';
	import Skeleton from '$lib/components/pages/settings/products/skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type ProductInput,
		type Query,
		type QueryProductArgs,
		type ProductType,
		type Mutation,
		type MutationProductDeleteArgs,
		type ProductChannelListingUpdateInput,
		type ProductVariantChannelListingUpdateInput,
		type ProductVariantBulkUpdateInput,
		type ProductVariantStocksUpdateInput,
		WeightUnitsEnum,
		type AttributeValueInput,
		AttributeInputTypeEnum,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { pick } from 'es-toolkit';
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

	// in product update screen
	let productVariantBulkUpdateInput = $state<ProductVariantBulkUpdateInput[]>([]);
	let existingAttributeInput = $state<AttributeValueInput[]>([]);

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
					variants,
					// assignedAttributes,
					attributes,
				} = result.data.product;

				currentProductType = productType;
				productTypeRequiresShipping = productType.isShippingRequired;
				product = {
					...product,
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

				existingAttributeInput = attributes.map(({ attribute, values }) => {
					let res: AttributeValueInput = {
						id: attribute.id,
					};

					if (attribute.inputType === AttributeInputTypeEnum.Dropdown && values.length) {
						res.dropdown = pick(values[0], ['id', 'value']);
					} else if (attribute.inputType === AttributeInputTypeEnum.Boolean && values.length) {
						res.boolean = values[0].boolean;
					} else if (attribute.inputType === AttributeInputTypeEnum.Date && values.length) {
						res.date = values[0].date;
					} else if (attribute.inputType === AttributeInputTypeEnum.File && values.length) {
					} else if (attribute.inputType === AttributeInputTypeEnum.Numeric) {
						// res.numeric = values[0].plainText
					} else if (attribute.inputType === AttributeInputTypeEnum.DateTime && values.length) {
						res.dateTime = values[0].dateTime;
					} else if (attribute.inputType === AttributeInputTypeEnum.Reference && values.length) {
					} else if (attribute.inputType === AttributeInputTypeEnum.RichText && values.length) {
						res.richText = values[0].richText;
					} else if (attribute.inputType === AttributeInputTypeEnum.PlainText && values.length) {
						res.plainText = values[0].plainText;
					} else if (attribute.inputType === AttributeInputTypeEnum.Multiselect) {
						res.multiselect = values.map((vl) => pick(vl, ['id']));
					} else if (attribute.inputType === AttributeInputTypeEnum.Swatch && values.length) {
						res.swatch = pick(values[0], ['id', 'value']);
					}

					return res;
				});

				if (media?.length) {
					productMedias = media.map<MediaObject>((item) => ({
						alt: item.alt,
						url: item.url,
						type: item.type,
					}));
				}

				if (variants?.length) {
					productVariantBulkUpdateInput = variants.map<ProductVariantBulkUpdateInput>(
						({ assignedAttributes, preorder, channelListings, stocks, weight, ...rest }) => {
							return {
								...rest,
								weight: weight || { value: 0, unit: WeightUnitsEnum.Kg },
								attributes: assignedAttributes.map((item) => item.attribute),
								preorder: preorder || {
									globalThreshold: undefined,
									globalSoldUnits: undefined,
									endDate: undefined,
								},
								channelListings: {
									// NOTE: we temporary force put this field here,
									// to make it easier for the variant editor component to do reference
									[ChannelListingExistingKey]: channelListings?.map((item) => item.id) || [],
									[ChannelListingCurrentKey]: channelListings?.map(({ costPrice, ...rest }) => ({
										...rest,
										costPrice: costPrice || {
											amount: 0,
											currency: rest.channel.currencyCode,
										},
									})),
								} as ProductVariantChannelListingUpdateInput,
								stocks: {
									[StockExistingKey]: stocks?.map((item) => item.id) || [],
									[StockCurrentKey]: stocks,
								} as ProductVariantStocksUpdateInput,
							};
						},
					);
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
			bind:productTypeRequiresShipping
			existingAttributes={existingAttributeInput}
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
		<div class={SitenameCommonClassName}>
			<ChannelsSelector
				bind:channelListingUpdateInput
				channelListings={channelListings || []}
				ok={productInputError.channelListing}
				{loading}
			/>
			<VariantsEditEditor
				disabled={loading}
				channelsListing={channelListingUpdateInput}
				bind:productVariantsInput={productVariantBulkUpdateInput}
				bind:privateMetadata={product.privateMetadata!}
				productTypeId={currentProductType.id}
			/>
		</div>
		<ProductSeo
			productName={product.name}
			bind:seo={product.seo!}
			bind:slug={product.slug}
			bind:formOk={productInputError.seo}
			{loading}
		/>
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
