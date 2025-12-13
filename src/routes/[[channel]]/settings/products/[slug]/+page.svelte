<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		PRODUCT_DELETE_MUTATION,
		PRODUCT_DETAIL_QUERY,
		ProductUpdateMutation,
		ProductVariantBulkUpdateMutation,
		UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import {
		ActionBar,
		GeneralMetadataEditor,
		type GeneralMetadataEditorRef,
	} from '$lib/components/pages/settings/common';
	import CategorySelector from '$lib/components/pages/settings/products/category-selector.svelte';
	import ChannelsSelector from '$lib/components/pages/settings/products/channels-selector.svelte';
	import CollectionsAndTax from '$lib/components/pages/settings/products/collections-and-tax.svelte';
	import GeneralInformation from '$lib/components/pages/settings/products/general-information.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/packaging-and-delivery.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/product-seo.svelte';
	import Skeleton from '$lib/components/pages/settings/products/skeleton.svelte';
	import {
		ProductPrivateMetadataVariantAttributeUsedKey,
		type CustomStockInput,
	} from '$lib/components/pages/settings/products/utils';
	import VariantsEditEditor, {
		ChannelListingCurrentKey,
		ChannelListingExistingKey,
		StockCurrentKey,
		StockExistingKey,
	} from '$lib/components/pages/settings/products/variants-edit-editor.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		type ProductInput,
		type Query,
		type QueryProductArgs,
		type Mutation,
		type MutationProductDeleteArgs,
		type ProductChannelListingUpdateInput,
		type ProductVariantChannelListingUpdateInput,
		type ProductVariantBulkUpdateInput,
		type ProductVariantStocksUpdateInput,
		type Weight,
		type BulkAttributeValueInput,
		type AttributeValueInput,
		type ProductVariantChannelListing,
		type Stock,
		type MutationProductUpdateArgs,
		type MutationProductChannelListingUpdateArgs,
		type MutationProductVariantBulkUpdateArgs,
		AttributeInputTypeEnum,
		WeightUnitsEnum,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { difference, omit, pick } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const ProductDetailStore = operationStore<Pick<Query, 'product'>, QueryProductArgs>({
		query: PRODUCT_DETAIL_QUERY,
		variables: {
			slug: page.params.slug,
		},
		requestPolicy: 'cache-and-network',
	});

	let loading = $state(false);
	let productInput = $state<ProductInput>({
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
		weight: {
			value: 0,
		},
	});
	let productTypeRequiresShipping = $state(false);
	let metaRef = $state<GeneralMetadataEditorRef>();
	let productMediasOk = $state(true);
	let productMedias = $state.raw<MediaObject[]>([]);
	let productFormOk = $state({
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

		generalForm: true,
		description: true,
		attributes: true,
		category: true,
		name: true,
		seo: true,
		channelListing: true,
	});
	let channelListingUpdateInput = $state.raw<ProductChannelListingUpdateInput>({});

	// in product update screen
	let productVariantBulkUpdateInput = $state<ProductVariantBulkUpdateInput[]>([]);

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
				} = result.data.product;

				// currentProductType = productType;
				productTypeRequiresShipping = productType.isShippingRequired;
				productInput = {
					...productInput,
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
					weight: pick(weight || ({} as Weight), ['value', 'unit']),
				};

				if (media?.length) {
					productMedias = media.map<MediaObject>((item) => ({
						alt: item.alt,
						url: item.url,
						type: item.type,
					}));
				}

				if (variants?.length) {
					productVariantBulkUpdateInput = variants.map<ProductVariantBulkUpdateInput>(
						({
							assignedAttributes,
							preorder,
							channelListings,
							stocks,
							weight,
							attributes,
							...rest
						}) => {
							return {
								...rest,
								weight: weight || { value: 0, unit: WeightUnitsEnum.Kg },
								attributes: attributes.map<BulkAttributeValueInput>(({ attribute, values }) => {
									const res: AttributeValueInput = {
										id: attribute.id,
									};

									switch (attribute.inputType) {
										case AttributeInputTypeEnum.Dropdown:
											res.dropdown = values.length
												? {
														value: values[0].value,
														id: values[0].id,
													}
												: {};
											break;

										case AttributeInputTypeEnum.Swatch:
											res.swatch = values.length
												? {
														value: values[0].value,
														id: values[0].id,
													}
												: {};
											break;
									}

									return res;
								}),
								preorder: preorder || {
									globalThreshold: undefined,
									globalSoldUnits: undefined,
									endDate: undefined,
								},
								channelListings: {
									// NOTE: we temporary force put this field here,
									// to make it easier for the variant editor component to do reference
									[ChannelListingExistingKey]: channelListings?.map((item) => item.id) || [],
									[ChannelListingCurrentKey]: channelListings?.map<ProductVariantChannelListing>(
										({ costPrice, ...rest }) => ({
											...rest,
											costPrice: costPrice || {
												amount: 0,
												currency: rest.channel.currencyCode,
												fractionDigits: 0,
												fractionalAmount: 0,
											},
										}),
									),
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
		loading = true;

		// 1) Update product itself
		const productUpdateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productUpdate'>,
			MutationProductUpdateArgs
		>(ProductUpdateMutation, {
			id: $ProductDetailStore.data?.product?.id,
			input: productInput,
		});

		if (checkIfGraphqlResultHasError(productUpdateResult, 'productUpdate')) {
			loading = false;
			return;
		}

		// 2) Update product channel listing
		const productChannelListingUpdateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productChannelListingUpdate'>,
			MutationProductChannelListingUpdateArgs
		>(UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION, {
			id: $ProductDetailStore.data?.product?.id!,
			input: channelListingUpdateInput,
		});

		if (
			checkIfGraphqlResultHasError(productChannelListingUpdateResult, 'productChannelListingUpdate')
		) {
			loading = false;
			return;
		}

		// 3) Update variants
		const actualProductVariantBulkUpdateInput = productVariantBulkUpdateInput.map(
			(variantInput) => {
				const res: ProductVariantBulkUpdateInput = omit(variantInput, [
					'channelListings',
					'stocks',
				]);

				// 1) parse channel listing
				const channelListingsRemoved = difference(
					variantInput.channelListings?.[ChannelListingExistingKey] as string[],
					variantInput.channelListings?.[ChannelListingCurrentKey]?.map(
						(item: any) => item.id,
					) as string[],
				);

				const channelListingsCreated = variantInput.channelListings?.[
					ChannelListingCurrentKey
				]?.filter((item: any) => !item.id) as unknown as ProductVariantChannelListing[];

				const channelListingsUpdated = variantInput.channelListings?.[
					ChannelListingCurrentKey
				]?.filter((item: any) => item.id) as unknown as ProductVariantChannelListing[];

				res.channelListings = {
					remove: channelListingsRemoved,
					create: channelListingsCreated?.map((item) => ({
						channelId: item.channel.id,
						costPrice: item.costPrice?.amount || 0,
						price: item.price?.amount || 0,
						preorderThreshold: item.preorderThreshold?.quantity,
					})),
					update: channelListingsUpdated.map((item) => ({
						channelListing: item.id,
						costPrice: item.costPrice?.amount || 0,
						price: item.price?.amount || 0,
						preorderThreshold: item.preorderThreshold?.quantity,
					})),
				};

				// 2) parse stocks
				const stocksRemoved = difference(
					variantInput.stocks?.[StockExistingKey] as string[],
					variantInput.stocks?.[StockCurrentKey]?.map((item: any) => item.id) as string[],
				);

				const stocksCreated = variantInput.stocks?.[StockCurrentKey]?.filter(
					(item: any) => !item?.id,
				) as CustomStockInput[];

				const stocksUpdated = variantInput.stocks?.[StockCurrentKey]?.filter(
					(item: any) => item.id,
				) as unknown as Stock[];

				res.stocks = {
					remove: stocksRemoved,
					create: stocksCreated?.map((item) => ({
						quantity: item.quantity,
						warehouse: item.warehouse,
					})),
					update: stocksUpdated?.map((item) => ({
						quantity: item.quantity,
						stock: item.id,
					})),
				};

				return res;
			},
		);

		const variantsUpdateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productVariantBulkUpdate'>,
			MutationProductVariantBulkUpdateArgs
		>(ProductVariantBulkUpdateMutation, {
			product: $ProductDetailStore.data?.product?.id!,
			variants: actualProductVariantBulkUpdateInput,
			// errorPolicy: ErrorPolicyEnum.RejectEverything,
		});

		if (checkIfGraphqlResultHasError(variantsUpdateResult, 'productVariantBulkUpdate')) {
			loading = false;
			return;
		}

		// 4) Update metadata
		const hasErr = await metaRef?.handleUpdate();
		loading = false;
		if (hasErr) return;

		toast.success($CommonState.EditSuccess);
		ProductDetailStore.reexecute({ variables: { id: $ProductDetailStore.data?.product?.id } });
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
					id: $ProductDetailStore.data?.product?.id,
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
{:else if $ProductDetailStore.data?.product}
	{@const { metadata, privateMetadata, id, channelListings, attributes, productType } =
		$ProductDetailStore.data.product}
	<div class="space-y-2">
		<GeneralInformation
			bind:name={productInput.name!}
			productType={productType.id}
			bind:description={productInput.description}
			bind:attributes={productInput.attributes!}
			bind:productTypeRequiresShipping
			bind:formOk={productFormOk.generalForm}
			disabled={loading}
			existingAttributes={attributes}
		/>
		<CategorySelector
			bind:categoryID={productInput.category!}
			bind:formOk={productFormOk.category}
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
				ok={productFormOk.channelListing}
				{loading}
			/>
			<VariantsEditEditor
				disabled={loading}
				channelsListing={channelListingUpdateInput}
				bind:productVariantsInput={productVariantBulkUpdateInput}
				bind:privateMetadata={productInput.privateMetadata!}
				productTypeId={productType.id}
			/>
		</div>
		<ProductSeo
			productName={productInput.name}
			bind:seo={productInput.seo!}
			bind:slug={productInput.slug}
			bind:formOk={productFormOk.seo}
			{loading}
		/>
		<CollectionsAndTax
			bind:collections={productInput.collections}
			bind:taxClassID={productInput.taxClass}
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
				bind:metadata={productInput.metadata}
				bind:weight={productInput.weight}
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
