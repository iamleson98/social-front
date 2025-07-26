<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		PRODUCT_TYPE_DELETE_MUTATION,
		PRODUCT_TYPE_QUERY,
		PRODUCT_TYPE_UPDATE_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/product-type/detail-skeleton.svelte';
	import GeneralInfo from '$lib/components/pages/settings/product-type/general-info.svelte';
	import ProductAttributes from '$lib/components/pages/settings/product-type/product-attributes.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		ProductTypeKindEnum,
		type Mutation,
		type MutationProductTypeDeleteArgs,
		type MutationProductTypeUpdateArgs,
		type ProductTypeInput,
		type Query,
		type QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const productTypeQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		kind: 'query',
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: page.params.id,
			attributeChoicesFirst: 1,
		},
		pause: !page.params.id,
	});

	let productTypeInput = $state<ProductTypeInput>({
		kind: ProductTypeKindEnum.Normal,
		name: '',
		isShippingRequired: true,
		taxClass: '',
		hasVariants: false,
	});

	let loading = $state(false);
	let performUpdateMetadata = $state(false);

	const onUpdateClick = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productTypeUpdate'>,
			MutationProductTypeUpdateArgs
		>(PRODUCT_TYPE_UPDATE_MUTATION, {
			id: page.params.id,
			input: productTypeInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'productTypeUpdate', $tranFunc('common.editSuccess')))
			return;
	};

	const onDeleteClick = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'productTypeDelete'>,
					MutationProductTypeDeleteArgs
				>(PRODUCT_TYPE_DELETE_MUTATION, {
					id: page.params.id,
				});

				loading = false;

				if (
					checkIfGraphqlResultHasError(result, 'productTypeDelete', $tranFunc('common.delSuccess'))
				)
					return;

				await goto(AppRoute.SETTINGS_PRODUCT_TYPES());
			},
		});
	};

	onMount(() =>
		productTypeQuery.subscribe((result) => {
			if (result.data?.productType) {
				const { hasVariants, isDigital, name, slug, isShippingRequired, kind, taxClass } =
					result.data.productType;

				productTypeInput = {
					hasVariants,
					isDigital,
					name,
					slug,
					isShippingRequired,
					kind,
					taxClass: taxClass?.id,
				};
			}
		}),
	);
</script>

{#if $productTypeQuery.fetching}
	<DetailSkeleton />
{:else if $productTypeQuery.error}
	<Alert variant="error" size="sm" bordered>{$productTypeQuery.error?.message}</Alert>
{:else if $productTypeQuery.data?.productType}
	{@const { metadata, privateMetadata, id, productAttributes, assignedVariantAttributes } =
		$productTypeQuery.data.productType}
	<div class="space-y-2">
		<GeneralInfo
			bind:name={productTypeInput.name!}
			disabled={loading}
			bind:kind={productTypeInput.kind!}
			bind:isShippingRequired={productTypeInput.isShippingRequired!}
			bind:taxClass={productTypeInput.taxClass!}
		/>
		<ProductAttributes
			productAttributes={productAttributes || []}
			productTypeId={id}
			disabled={loading}
			assignedVariantAttributes={assignedVariantAttributes || []}
			bind:hasVariants={productTypeInput.hasVariants!}
		/>

		<GeneralMetadataEditor objectId={id} {metadata} {privateMetadata} bind:performUpdateMetadata />
	</div>

	<ActionBar
		{onUpdateClick}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_PRODUCT_TYPES()}
		{onDeleteClick}
	/>
{/if}
