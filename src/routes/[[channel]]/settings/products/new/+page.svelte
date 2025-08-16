<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		CREATE_PRODUCT_MUTATION,
		PRODUCT_MEDIA_CREATE_MUTATION,
		PRODUCT_VARIANTS_BULK_CREATE_MUTATION,
		UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import ProductType from '$lib/components/common/product-type-select/product-type.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import CategorySelector from '$lib/components/pages/settings/products/new/category-selector.svelte';
	import ChannelsSelector from '$lib/components/pages/settings/products/new/channels-selector.svelte';
	import CollectionAndTax from '$lib/components/pages/settings/products/new/collections-and-tax.svelte';
	import GeneralInformation from '$lib/components/pages/settings/products/new/general-information.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/new/packaging-and-delivery.svelte';
	import ProductAttributeEditor from '$lib/components/pages/settings/products/new/product-attribute-editor.svelte';
	import ProductDescriptionEditorjsComponent from '$lib/components/pages/settings/products/new/product-description-editorjs-component.svelte';
	import ProductMedia from '$lib/components/pages/settings/products/new/product-media.svelte';
	import ProductName from '$lib/components/pages/settings/products/new/product-name.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/new/product-seo.svelte';
	import ProductVariantCreator from '$lib/components/pages/settings/products/new/product-variant-creator.svelte';
	import { Button } from '$lib/components/ui';
	import type {
		Mutation,
		MutationProductChannelListingUpdateArgs,
		MutationProductCreateArgs,
		MutationProductMediaCreateArgs,
		MutationProductVariantBulkCreateArgs,
		ProductChannelListingAddInput,
		ProductChannelListingUpdateInput,
		ProductCreateInput,
		ProductVariantBulkCreateInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils/routes';
	import type { MediaObject } from '$lib/utils/types';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { noop, omit } from 'es-toolkit';
	import { toast } from 'svelte-sonner';

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
			{ key: 'height', value: '0' },
		],
		privateMetadata: [],
		collections: [],
		description: {
			blocks: [],
		},
	});
	let channelListingUpdateInput = $state.raw<ProductChannelListingUpdateInput>({});
	let channelListingUpdateInputOk = $state(true);
	let productMedias = $state.raw<MediaObject[]>([]);
	let productMediasOk = $state(true);

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
		seo: false,
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);
	let loading = $state(false);

	const setLoading = (load: boolean) => (loading = load);

	const createProductMedias = async (productID: string) => {
		if (!productMedias.length) return;

		const operations = productMedias.map((media) => {
			return GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'productMediaCreate'>,
				MutationProductMediaCreateArgs
			>(
				PRODUCT_MEDIA_CREATE_MUTATION,
				{
					input: {
						product: productID,
						alt: media.alt,
						image: media.file,
					},
				},
				{
					requestPolicy: 'network-only',
				},
			);
		});

		const results = await Promise.all(operations);
		let numFails = 0;
		for (const result of results) {
			if (checkIfGraphqlResultHasError(result, 'productMediaCreate')) numFails++;
		}

		/**
		 * In case user want to assign some media(s) to some variant(s),
		 * For that API to work, we have to assign just created media images to media state,
		 * So the variant editors know how to mapping them
		 */
	};

	const handleSubmit = async () => {
		// validate:
		if (
			!channelListingUpdateInput.updateChannels?.some(
				(item) => item['used' as keyof ProductChannelListingAddInput],
			)
		) {
			channelListingUpdateInputOk = false;
			return;
		}

		setLoading(true);

		// 1) Create product
		const productCreateBody: ProductCreateInput = {
			...productCreateInput,
			description: productCreateInput.description
				? JSON.stringify(productCreateInput.description)
				: null,
		};

		const productCreateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productCreate'>,
			MutationProductCreateArgs
		>(CREATE_PRODUCT_MUTATION, {
			input: productCreateBody,
		});
		if (checkIfGraphqlResultHasError(productCreateResult, 'productCreate')) {
			setLoading(false);
			return;
		}

		// 2) assign product channel listings
		// clean input
		const cleanChannelListingUpdateInput: ProductChannelListingUpdateInput = {
			...channelListingUpdateInput,
			updateChannels: channelListingUpdateInput.updateChannels.map((item) =>
				omit(item, [
					'used' as keyof ProductChannelListingAddInput,
					'channelName' as keyof ProductChannelListingAddInput,
					'currency' as keyof ProductChannelListingAddInput,
				]),
			) as ProductChannelListingAddInput[],
		};

		const updateProductChannelListingResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productChannelListingUpdate'>,
			MutationProductChannelListingUpdateArgs
		>(UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION, {
			id: productCreateResult.data?.productCreate?.product?.id as string,
			input: cleanChannelListingUpdateInput,
		});
		if (
			checkIfGraphqlResultHasError(updateProductChannelListingResult, 'productChannelListingUpdate')
		) {
			setLoading(false);
			return;
		}

		// 3) bulk create variants
		const variantsBulkCreateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productVariantBulkCreate'>,
			MutationProductVariantBulkCreateArgs
		>(PRODUCT_VARIANTS_BULK_CREATE_MUTATION, {
			product: productCreateResult.data?.productCreate?.product?.id as string,
			variants: productVariantsInput,
		});
		if (checkIfGraphqlResultHasError(variantsBulkCreateResult, 'productVariantBulkCreate')) return;

		let hasError = false;
		for (const result of variantsBulkCreateResult.data?.productVariantBulkCreate?.results || []) {
			if (result.errors?.length) {
				toast.error(result.errors[0].message as string);
				hasError = true;
			}
		}

		if (hasError) {
			setLoading(false);
			return;
		}

		// 4) create product medias
		await createProductMedias(productCreateResult.data?.productCreate?.product?.id as string);

		toast.success($tranFunc('product.prdCreated'));
	};
</script>

<div class="space-y-2">
	<!-- <ProductName bind:name={productCreateInput.name} bind:ok={productInputError.name} {loading} />
	<ProductType
		bind:value={productCreateInput.productType}
		bind:ok={productInputError.productType}
		{loading}
	/>
	<ProductAttributeEditor
		productTypeID={productCreateInput.productType}
		bind:attributes={productCreateInput.attributes!}
		bind:ok={productInputError.attributes}
		{loading}
	/> -->
	<GeneralInformation
		bind:name={productCreateInput.name!}
		bind:productType={productCreateInput.productType}
		disabled={loading}
		bind:description={productCreateInput.description}
		bind:attributes={productCreateInput.attributes!}
	/>
	<CategorySelector
		bind:categoryID={productCreateInput.category}
		bind:ok={productInputError.category}
		{loading}
	/>
	<!-- <ProductMedia bind:medias={productMedias} {loading} /> -->
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
	<!-- <ProductDescriptionEditorjsComponent
		bind:description={productCreateInput.description}
		bind:ok={productInputError.description}
	/> -->
	<div class={SitenameCommonClassName}>
		<ChannelsSelector bind:channelListingUpdateInput ok={channelListingUpdateInputOk} {loading} />
		<ProductVariantCreator
			bind:productVariantsInput
			channelsListing={channelListingUpdateInput}
			{loading}
			{productMedias}
		/>
	</div>
	<ProductSeo
		productName={productCreateInput.name}
		bind:seo={productCreateInput.seo!}
		bind:slug={productCreateInput.slug}
		bind:ok={productInputError.seo}
		{loading}
	/>
	<CollectionAndTax
		bind:collections={productCreateInput.collections}
		bind:taxClassID={productCreateInput.taxClass}
		{loading}
	/>
	<PackagingAndDelivery
		bind:metadata={productCreateInput.metadata}
		bind:weight={productCreateInput.weight}
		{loading}
	/>
	<!-- <GeneralMetadataEditor /> -->

	<!-- <Button
		size="md"
		variant="filled"
		fullWidth
		onclick={handleSubmit}
		{loading}
		disabled={!Object.values(productInputError).every(Boolean) || loading}
	>
		{$tranFunc('btn.create')}
	</Button> -->
</div>

<ActionBar
	onAddClick={noop}
	backButtonUrl={AppRoute.SETTINGS_PRODUCTS()}
	disableCreateButton={false}
/>
