<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		PRODUCT_TYPE_ASSIGN_ATTRIBUTES_MUTATION,
		PRODUCT_TYPE_AVAILABLE_ATTRIBUTES_QUERY,
		PRODUCT_TYPE_QUERY,
	} from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { TAX_CLASSES_QUERY } from '$lib/api/tax';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Search } from '$lib/components/icons';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import GeneralInfo from '$lib/components/pages/settings/product-type/general-info.svelte';
	import ProductAttributes from '$lib/components/pages/settings/product-type/product-attributes.svelte';
	import VariantAttributes from '$lib/components/pages/settings/product-type/variant-attributes.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, DebounceInput, Input, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableSelect, SelectSkeleton } from '$lib/components/ui/select';
	import {
		GraphqlPaginableTable,
		Table,
		type TableColumnProps,
		type TableProps,
	} from '$lib/components/ui/Table';
	import {
		ProductAttributeType,
		ProductTypeKindEnum,
		type AssignedVariantAttribute,
		type Attribute,
		type Mutation,
		type MutationProductAttributeAssignArgs,
		type ProductType,
		type ProductTypeInput,
		type Query,
		type QueryProductTypeArgs,
		type QueryTaxClassesArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, toggleItemNoDup } from '$lib/utils/utils';
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
	let openAssignAttributeModal = $state(false);
	let availableAttributeVariables = $state({
		id: page.params.id,
		first: 20,
		filter: {
			search: '',
		},
	});
	let forceFetchAvailableAttributes = $state(false);
	let selectedProductAttributes = $state<string[]>([]);

	const onUpdateClick = async () => {};

	const onDeleteClick = async () => {};

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
	<SelectSkeleton label />
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
		<ProductAttributes productAttributes={productAttributes || []} productTypeId={id} />
		<VariantAttributes
			bind:hasVariants={productTypeInput.hasVariants!}
			assignedVariantAttributes={assignedVariantAttributes || []}
			productTypeId={id}
		/>

		<GeneralMetadataEditor objectId={id} {metadata} {privateMetadata} bind:performUpdateMetadata />
	</div>

	<ActionBar
		{onUpdateClick}
		disabled={loading}
		disableDeleteButton={loading}
		backButtonUrl={AppRoute.SETTINGS_PRODUCT_TYPES()}
		{onDeleteClick}
	/>
{/if}
