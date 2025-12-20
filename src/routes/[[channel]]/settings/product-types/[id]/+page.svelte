<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { T } from '$i18n';
	import {
		PRODUCT_TYPE_ATTRIBUTE_ASSIGNMENT_UPDATE_MUTATION,
		PRODUCT_TYPE_DELETE_MUTATION,
		PRODUCT_TYPE_QUERY,
		PRODUCT_TYPE_UPDATE_MUTATION,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/product-type/detail-skeleton.svelte';
	import EditPageAttributes from '$lib/components/pages/settings/product-type/edit-page-attributes.svelte';
	import GeneralInfo from '$lib/components/pages/settings/product-type/general-info.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		ProductTypeKindEnum,
		type Mutation,
		type MutationProductAttributeAssignmentUpdateArgs,
		type MutationProductTypeDeleteArgs,
		type MutationProductTypeUpdateArgs,
		type ProductAttributeAssignmentUpdateInput,
		type ProductTypeInput,
		type Query,
		type QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const productTypeQuery = operationStore<
		Pick<Query, 'productType'>,
		QueryProductTypeArgs & { attributeChoicesFirst: number }
	>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: page.params.id as string,
			attributeChoicesFirst: 1,
		},
		pause: !page.params.id,
		requestPolicy: 'cache-and-network',
	});

	let productTypeInput = $state<ProductTypeInput>({
		kind: ProductTypeKindEnum.Normal,
		name: '',
		isShippingRequired: true,
		taxClass: '',
		hasVariants: false,
		slug: '',
	});

	let loading = $state(false);
	let generalFormOk = $state(true);
	let metadataRef = $state<GeneralMetadataEditorRef>();
	let variantSelectionOperations = $state<ProductAttributeAssignmentUpdateInput[]>([]);

	/** if existed state is false, then user change to true, we must update the product type itself first before
	 * we can assign attributes to variants
	 */
	let initialHasVariants = $state(false);

	const handleUpdateProductType = async () => {
		// NOTE: we have to create a copy of current value of this state.
		// Since the state will be reassigned right after update product type itself.
		const variantSelectionOptionsSnapShot = $state.snapshot(variantSelectionOperations);

		loading = true;
		// update product type itself
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productTypeUpdate'>,
			MutationProductTypeUpdateArgs
		>(PRODUCT_TYPE_UPDATE_MUTATION, {
			id: page.params.id as string,
			input: productTypeInput,
		});
		if (checkIfGraphqlResultHasError(result, 'productTypeUpdate')) {
			loading = false;
			return;
		}

		// update metadata
		const hasErr = await metadataRef?.handleUpdate();
		if (hasErr) {
			loading = false;
			return;
		}

		// update variant selection
		const variantSelectionResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'productAttributeAssignmentUpdate'>,
			MutationProductAttributeAssignmentUpdateArgs
		>(PRODUCT_TYPE_ATTRIBUTE_ASSIGNMENT_UPDATE_MUTATION, {
			productTypeId: page.params.id as string,
			operations: variantSelectionOptionsSnapShot,
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(
				variantSelectionResult,
				'productAttributeAssignmentUpdate',
				$CommonState.EditSuccess,
			)
		)
			return;

		productTypeQuery.reexecute({
			context: { requestPolicy: 'network-only' },
			variables: { id: page.params.id as string, attributeChoicesFirst: 1 },
		});
	};

	$effect(() => {
		if (productTypeInput.hasVariants !== initialHasVariants) {
			initialHasVariants = productTypeInput.hasVariants!;
			handleUpdateProductType();
		}
	});

	const onDeleteClick = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $T('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'productTypeDelete'>,
					MutationProductTypeDeleteArgs
				>(PRODUCT_TYPE_DELETE_MUTATION, {
					id: page.params.id as string,
				});

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'productTypeDelete', $CommonState.DeleteSuccess))
					return;

				await goto(AppRoute.SETTINGS_PRODUCT_TYPES());
			},
		});
	};

	onMount(() =>
		productTypeQuery.subscribe((result) => {
			if (result.data?.productType) {
				const {
					hasVariants,
					isDigital,
					name,
					slug,
					isShippingRequired,
					kind,
					taxClass,
					assignedVariantAttributes,
				} = result.data.productType;

				initialHasVariants = hasVariants; //

				if (assignedVariantAttributes)
					variantSelectionOperations =
						assignedVariantAttributes?.map<ProductAttributeAssignmentUpdateInput>((attr) => ({
							variantSelection: attr.variantSelection,
							id: attr.attribute.id,
						}));

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
			bind:formOk={generalFormOk}
			bind:slug={productTypeInput.slug!}
		/>
		<EditPageAttributes
			productAttributes={productAttributes || []}
			productTypeId={id}
			disabled={loading}
			assignedVariantAttributes={assignedVariantAttributes || []}
			bind:hasVariants={productTypeInput.hasVariants!}
			bind:variantSelectionOperations
		/>
		<GeneralMetadataEditor
			objectId={id}
			{metadata}
			{privateMetadata}
			disabled={loading}
			bind:this={metadataRef}
		/>
	</div>

	<ActionBar
		onUpdateClick={handleUpdateProductType}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_PRODUCT_TYPES()}
		{onDeleteClick}
		disableUpdateButton={!generalFormOk || loading}
	/>
{/if}
