<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		ATTRIBUTE_UPDATE_MUTATION,
		ATTRIBUTE_VALUE_CREATE_MUTATION,
		ATTRIBUTE_VALUES_QUERY,
	} from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Icon, Plus } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		GraphqlPaginableSelect,
		Select,
		SelectSkeleton,
		type SelectOption,
	} from '$lib/components/ui/select';
	import { type GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import {
		AttributeInputTypeEnum,
		type BulkAttributeValueInput,
		type Mutation,
		type MutationAttributeUpdateArgs,
		type MutationAttributeValueCreateArgs,
		type ProductVariantBulkCreateInput,
		type Query,
		type QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { set } from 'es-toolkit/compat';

	type Props = {
		productTypeId: string;
		productName?: string;
	};

	let { productTypeId, productName = '' }: Props = $props();

	type VariantManifest = {
		attribute: {
			id: string;
			name: string;
		};
		values: SelectOption[];
	};

	const MAX_VARIANT_TYPES = 2;

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: '',
		},
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	let variantManifests = $state<VariantManifest[]>([]);
	let loading = $state(false);
	let performAttributeValuesFetching = $state(true);
	const ProductNameAcronym = $derived(
		productName
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.split(' ')
			.map((word) => word[0])
			.join(),
	);

	const AvailableAttributeOptions = $derived(
		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes
			?.filter((attr) => attr.variantSelection)
			.map<SelectOption>((attr) => ({
				value: attr.attribute.id,
				label: (attr.attribute.name || attr.attribute.slug) as string,
				disabled: variantManifests.some((manifest) => manifest.attribute.id === attr.attribute.id),
			})) || [],
	);

	$effect(() => {
		if (productTypeId)
			ProductTypeDetailQuery.reexecute({
				variables: { id: productTypeId },
			});
	});

	let variantsInputDetails = $state<ProductVariantBulkCreateInput[]>([]);

	const handleAddVariantManifest = async () => {
		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});
	};

	const handleAddNewAttributeValue = async (attributeId: string, value: string) => {
		const isSwatchAttribute =
			$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
				(attr) => attr.attribute.id === attributeId,
			)?.attribute.inputType === AttributeInputTypeEnum.Swatch;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeValueCreate'>,
			MutationAttributeValueCreateArgs
		>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
			attribute: attributeId,
			input: {
				name: value,
				value: isSwatchAttribute ? value : undefined,
			},
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'attributeValueCreate')) return;

		// added value success, perform refetching now
		performAttributeValuesFetching = true;
	};

	const handleVariantValuesChange = (
		manifestIdx: number,
		options?: SelectOption | SelectOption[],
	) => {
		const newOptions = (options || []) as SelectOption[];

		variantManifests[manifestIdx].values = (options as SelectOption[]) || [];

		if (variantManifests.length === 1) {
			// variantsInputDetails = variantsInputDetails.map((item) => {
			// 	const isSwatchAttribute =
			// 		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
			// 			(attr) => attr.attribute.id === variantManifests[0].attribute.id,
			// 		)?.attribute.inputType === AttributeInputTypeEnum.Swatch;

			// 	const result: BulkAttributeValueInput = {
			// 		id: variantManifests[0].attribute.id,
			// 	};

			//   if (isSwatchAttribute) {
			//     result.swatch = {

			//     }
			//   } else {

			//   }

			// 	return {
			// 		...item,
			// 		attributes: [
			// 			{
			// 				id: variantManifests[0].attribute.id,
			// 			},
			// 		],
			// 	};
			// });

			variantsInputDetails = variantManifests[0].values.map<ProductVariantBulkCreateInput>(
				(attrValue) => {
					const variantWithAttrValueExisted = variantsInputDetails.find((variantDetail) =>
						variantDetail.attributes.some(
							(attrInput) =>
								attrInput.dropdown?.value === attrValue.value ||
								attrInput.swatch?.value === attrValue.value,
						),
					);

					if (variantWithAttrValueExisted) return variantWithAttrValueExisted;

					const isSwatchAttribute =
						$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
							(attr) => attr.attribute.id === variantManifests[0].attribute.id,
						)?.attribute.inputType === AttributeInputTypeEnum.Swatch;

					const attributeProp: BulkAttributeValueInput = {
						id: variantManifests[0].attribute.id,
					};

					if (isSwatchAttribute) set(attributeProp, 'swatch.value', attrValue.value);
					else set(attributeProp, 'dropdown.value', attrValue.value);

					return {
						attributes: [attributeProp],
						name: `${ProductNameAcronym}-${attrValue.value}`,
						sku: `${ProductNameAcronym}-${attrValue.value}`,
						trackInventory: true,
					};
				},
			);
		}
	};
</script>

<div class={SitenameCommonClassName}>
	{#if $ProductTypeDetailQuery.fetching}
		<div class="grid grid-cols-2 gap-2">
			<SelectSkeleton label />
			<SelectSkeleton label />
		</div>
	{:else if $ProductTypeDetailQuery.error}
		<Alert variant="error" size="sm">{$ProductTypeDetailQuery.error.message}</Alert>
	{:else if $ProductTypeDetailQuery.data?.productType}
		<div class="grid grid-cols-2 gap-2">
			{#each variantManifests as manifest, idx (idx)}
				<div class="space-y-2">
					<Select
						placeholder="Select an attribute"
						label="Attribute"
						options={AvailableAttributeOptions}
						bind:value={manifest.attribute.id}
					/>

					{#if manifest.attribute.id}
						<GraphqlPaginableSelect
							disabled={loading}
							query={ATTRIBUTE_VALUES_QUERY}
							variables={{
								id: manifest.attribute.id,
								first: 15,
								filter: { search: '' },
							} as GraphqlPaginationArgs}
							label="Attribute values"
							resultKey={'attribute.choices' as keyof Query}
							variableSearchQueryPath="filter.search"
							optionValueKey="id"
							optionLabelKey="name"
							multiple
							value={manifest.values.map((item) => item.value)}
							onchange={(opt) => handleVariantValuesChange(idx, opt)}
							size="sm"
							bind:performDataFetching={performAttributeValuesFetching}
							onNotFoundQuerySelected={(newValue) =>
								newValue && handleAddNewAttributeValue(manifest.attribute.id, newValue)}
						/>
					{/if}
				</div>
			{/each}
			{#if variantManifests.length < MAX_VARIANT_TYPES && AvailableAttributeOptions.some((opt) => !opt.disabled)}
				<button
					class={[
						'border-dashed border w-full h-full flex items-center justify-center rounded-lg tooltip tooltip-top border-blue-500 text-blue-500 cursor-pointer py-5 hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50',
					]}
					onclick={handleAddVariantManifest}
					data-tip={$tranFunc('product.addVariant')}
					aria-label={$tranFunc('product.addVariant')}
				>
					<Icon icon={Plus} size="xl" />
				</button>
			{/if}
		</div>
	{/if}
</div>
