<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import {
		CREATE_PRODUCT_MUTATION,
		PRODUCT_DELETE_MUTATION,
		PRODUCT_MEDIA_CREATE_MUTATION,
		PRODUCT_VARIANTS_BULK_CREATE_MUTATION,
		UPDATE_PRODUCT_CHANNEL_LISTINGS_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import FileInputContainer from '$lib/components/common/file-input-container.svelte';
	import {
		GeneralMetadataEditor,
		type GeneralMetadataEditorRef,
	} from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import CategorySelector from '$lib/components/pages/settings/products/new/category-selector.svelte';
	import ChannelsSelector from '$lib/components/pages/settings/products/new/channels-selector.svelte';
	import CollectionAndTax from '$lib/components/pages/settings/products/new/collections-and-tax.svelte';
	import GeneralInformation from '$lib/components/pages/settings/products/new/general-information.svelte';
	import PackagingAndDelivery from '$lib/components/pages/settings/products/new/packaging-and-delivery.svelte';
	import ProductSeo from '$lib/components/pages/settings/products/new/product-seo.svelte';
	import VariantsEditor from '$lib/components/pages/settings/products/new/variants-editor.svelte';
	import type {
		Mutation,
		MutationProductChannelListingUpdateArgs,
		MutationProductCreateArgs,
		MutationProductDeleteArgs,
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
	import { omit } from 'es-toolkit';
	import { toast } from 'svelte-sonner';

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
		category: '',
	});
	let channelListingUpdateInput = $state.raw<ProductChannelListingUpdateInput>({});
	let productMedias = $state.raw<MediaObject[]>([]);
	let metaRef = $state<GeneralMetadataEditorRef>();
	let productTypeRequiresShipping = $state(true);

	let productInputError = $state({
		metadata: false,
		generalInfo: false,
		category: false,
		seo: false,
		productMedias: false,
		channelListing: true,
	});

	let productVariantsInput = $state.raw<ProductVariantBulkCreateInput[]>([]);
	let loading = $state(false);

	const handleUndoCreateProduct = async (id: string) => {
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productDelete'>,
			MutationProductDeleteArgs
		>(PRODUCT_DELETE_MUTATION, { id });
		return !checkIfGraphqlResultHasError(result, 'productDelete');
	};

	const createProductMedias = async (productID: string) => {
		if (!productMedias.length) return 0;

		const operations = productMedias.map((media) => {
			return GRAPHQL_CLIENT.mutation<
				Pick<Mutation, 'productMediaCreate'>,
				MutationProductMediaCreateArgs
			>(PRODUCT_MEDIA_CREATE_MUTATION, {
				input: {
					product: productID,
					alt: media.alt,
					image: media.file,
				},
			});
		});

		const results = await Promise.all(operations);
		let numFails = 0;
		for (const result of results) {
			if (checkIfGraphqlResultHasError(result, 'productMediaCreate')) numFails++;
		}

		return numFails;

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
			productInputError.channelListing = false;
			return;
		}

		loading = true;

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
			loading = false;
			return;
		}

		const createdProductId = productCreateResult.data?.productCreate?.product?.id as string;

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
			id: createdProductId,
			input: cleanChannelListingUpdateInput,
		});
		if (
			checkIfGraphqlResultHasError(updateProductChannelListingResult, 'productChannelListingUpdate')
		) {
			await handleUndoCreateProduct(createdProductId);
			loading = false;
			return;
		}

		// 3) bulk create variants
		const variantsBulkCreateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productVariantBulkCreate'>,
			MutationProductVariantBulkCreateArgs
		>(PRODUCT_VARIANTS_BULK_CREATE_MUTATION, {
			product: createdProductId,
			variants: productVariantsInput,
		});
		if (checkIfGraphqlResultHasError(variantsBulkCreateResult, 'productVariantBulkCreate')) {
			await handleUndoCreateProduct(createdProductId);
			loading = false;
			return;
		}

		let hasError = false;
		for (const result of variantsBulkCreateResult.data?.productVariantBulkCreate?.results || []) {
			if (result.errors?.length) {
				toast.error(result.errors[0].message as string);
				hasError = true;
			}
		}

		if (hasError) {
			loading = false;
			return;
		}

		// 4) create product medias
		const totalFails = await createProductMedias(createdProductId);
		if (totalFails) {
			await handleUndoCreateProduct(createdProductId);
			loading = false;
			return;
		}

		// 5) update metadatas
		const metaHasErr = await metaRef?.handleUpdate(createdProductId);
		if (metaHasErr) {
			await handleUndoCreateProduct(createdProductId);
			loading = false;
			return;
		}

		loading = false;

		toast.success($tranFunc('product.prdCreated'));

		await goto(AppRoute.SETTINGS_PRODUCTS_EDIT(productCreateResult.data?.productCreate?.product?.slug!));
	};
</script>

<div class="space-y-2">
	<GeneralInformation
		bind:name={productCreateInput.name!}
		bind:productType={productCreateInput.productType}
		bind:description={productCreateInput.description}
		bind:attributes={productCreateInput.attributes!}
		disabled={loading}
		bind:formOk={productInputError.generalInfo}
		bind:productTypeRequiresShipping
		isCreatePage
	/>
	<CategorySelector
		bind:categoryID={productCreateInput.category!}
		bind:formOk={productInputError.category!}
		{loading}
		isCreatePage
	/>
	<FileInputContainer
		accept="image/*"
		max={9}
		class={SitenameCommonClassName}
		bind:medias={productMedias}
		label={$tranFunc('common.pic')}
		bind:formOk={productInputError.productMedias}
		disabled={loading}
		required
	/>
	<div class={SitenameCommonClassName}>
		<ChannelsSelector
			bind:channelListingUpdateInput
			ok={productInputError.channelListing}
			{loading}
		/>
		{#if productCreateInput.productType}
			<VariantsEditor
				disabled={loading}
				productTypeId={productCreateInput.productType}
				{productMedias}
				channelsListing={channelListingUpdateInput}
				bind:productVariantsInput
				bind:privateMetadata={productCreateInput.privateMetadata!}
			/>
		{/if}
	</div>
	<ProductSeo
		productName={productCreateInput.name}
		bind:seo={productCreateInput.seo!}
		bind:slug={productCreateInput.slug}
		bind:formOk={productInputError.seo!}
		{loading}
	/>
	<CollectionAndTax
		bind:collections={productCreateInput.collections}
		bind:taxClassID={productCreateInput.taxClass}
		{loading}
	/>
	<GeneralMetadataEditor
		bind:this={metaRef}
		disabled={loading}
		bind:formOk={productInputError.metadata}
	/>
	{#if productTypeRequiresShipping}
		<PackagingAndDelivery
			bind:metadata={productCreateInput.metadata}
			bind:weight={productCreateInput.weight}
			{loading}
		/>
	{/if}
</div>

<ActionBar
	backButtonUrl={AppRoute.SETTINGS_PRODUCTS()}
	disableCreateButton={loading || !Object.values(productInputError).every(Boolean)}
	onAddClick={handleSubmit}
/>
