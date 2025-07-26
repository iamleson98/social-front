<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPE_CREATE_MUTATION } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInfo from '$lib/components/pages/settings/product-type/general-info.svelte';
	import {
		ProductTypeKindEnum,
		type Mutation,
		type MutationProductTypeCreateArgs,
		type ProductTypeInput,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import CreatePageAttributes from '$lib/components/pages/settings/product-type/create-page-attributes.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let productTypeInput = $state<ProductTypeInput>({
		hasVariants: false,
		isShippingRequired: true,
		kind: ProductTypeKindEnum.Normal,
		name: '',
		taxClass: undefined,
		productAttributes: [],
		variantAttributes: [],
		slug: '',
	});
	let loading = $state(false);
	let createdProductTypeId = $state<string>('');
	let performUpdateMetadata = $state(false);
	let generalFormOk = $state(false);
	let attrFormOk = $state(false);

	const onAddClick = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productTypeCreate'>,
			MutationProductTypeCreateArgs
		>(PRODUCT_TYPE_CREATE_MUTATION, {
			input: productTypeInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productTypeCreate')) return;

		createdProductTypeId = result.data?.productTypeCreate?.productType?.id!;
		performUpdateMetadata = true;
	};

	const handleDoneCreate = async () => {
		toast.success($tranFunc('common.createSuccess'));
		await goto(AppRoute.SETTINGS_PRODUCT_TYPE_EDIT(createdProductTypeId));
	};
</script>

<div class="space-y-2">
	<GeneralInfo
		bind:name={productTypeInput.name!}
		disabled={loading}
		bind:kind={productTypeInput.kind!}
		bind:isShippingRequired={productTypeInput.isShippingRequired!}
		bind:taxClass={productTypeInput.taxClass!}
		bind:formOk={generalFormOk}
		bind:slug={productTypeInput.slug!}
		isCreatePage
	/>
	<CreatePageAttributes
		bind:hasVariants={productTypeInput.hasVariants!}
		disabled={loading}
		bind:productAttributesToAssign={productTypeInput.productAttributes!}
		bind:variantAttributesToAssign={productTypeInput.variantAttributes!}
		bind:formOk={attrFormOk}
	/>

	<GeneralMetadataEditor
		objectId={createdProductTypeId}
		bind:performUpdateMetadata
		onDoneUpdate={handleDoneCreate}
		disabled={loading}
	/>
</div>

<ActionBar
	disabled={loading}
	backButtonUrl={AppRoute.SETTINGS_PRODUCT_TYPES()}
	{onAddClick}
	disableBackButton={loading}
	disableCreateButton={loading || !generalFormOk || !attrFormOk}
/>
