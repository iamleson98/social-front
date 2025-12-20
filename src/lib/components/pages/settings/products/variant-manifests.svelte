<script lang="ts">
	import { T } from '$i18n';
	import {
		ATTRIBUTE_VALUE_CREATE_MUTATION,
		ATTRIBUTE_VALUES_QUERY,
	} from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Icon, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { type GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import {
		GraphqlPaginableSelect,
		Select,
		SelectSkeleton,
		type SelectOption,
	} from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type MetadataInput,
		type Mutation,
		type MutationAttributeValueCreateArgs,
		type Query,
		type QueryProductTypeArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { MAX_VARIANT_TYPES, ProductPrivateMetadataVariantAttributeUsedKey, type VariantManifest } from './utils';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	type Props = {
		variantManifests: VariantManifest[];
		disabled?: boolean;
		productTypeId: string;
		/** required, to auto set the private metadata of variant attributes */
		privateMetadata: MetadataInput[];
		onVariantValuesChange: () => void;
		onManifestDeleted: () => void;
	};

	let {
		variantManifests = $bindable(),
		disabled,
		productTypeId,
		privateMetadata = $bindable(),
		onVariantValuesChange,
		onManifestDeleted,
	}: Props = $props();

	/**
	 * there are at most 2 attributes used for variants creation, so this list has 2 booleans.
	 * If user can not find her desired attribute values, we support auto create feature,
	 * so user do not have to visit the attribute detail page to add more values.
	 *
	 * With that said, after an attribute value is added, we must use this list, to trigger according select to refetch and find for created attribute values.
	 */
	let manifestPerformFetchingAttributeValues = $state([false, false]);
	let innerLoading = $state(false);

	const ShouldDisable = $derived(disabled || innerLoading);

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: productTypeId,
		},
		requestPolicy: 'cache-and-network',
	});

	const AvailableAttributeOptions = $derived(
		$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes
			?.filter((attr) => attr.variantSelection)
			.map<SelectOption>((attr) => ({
				value: attr.attribute.id,
				label: (attr.attribute.name || attr.attribute.slug) as string,
				disabled: variantManifests.some((manifest) => manifest.attribute.id === attr.attribute.id),
			})) || [],
	);

	/**
	 * This function helps setting the attribute usage by product variants, into private metadata
	 */
	const recalculateVariantAttributeMetadata = () => {
		const setAttrValues = variantManifests.filter((item) => !!item.attribute.id);
		if (!setAttrValues.length) return;

		const attrInforValue = JSON.stringify(setAttrValues);
		if (
			!privateMetadata.some((item) => item.key === ProductPrivateMetadataVariantAttributeUsedKey)
		) {
			privateMetadata.push({
				key: ProductPrivateMetadataVariantAttributeUsedKey,
				value: attrInforValue,
			});
		} else {
			privateMetadata = privateMetadata.map((item) => {
				if (item.key === ProductPrivateMetadataVariantAttributeUsedKey) {
					item.value = attrInforValue;
				}
				return item;
			});
		}
	};

	const handleAddVariantManifest = async () => {
		// when a variant manifest is added, we must force the <Select /> to fetch attribute values
		manifestPerformFetchingAttributeValues[!variantManifests.length ? 0 : 1] = true;

		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});

		recalculateVariantAttributeMetadata();
	};

	/**
	 * Handles when user change attribute of a manifest.
	 * 1) If user really selected new attribute (selectedNewAttribute = true)
	 *  +) force refetch attribute values of the new selected attribute
	 * 	+) clear existing selected attribute values if have
	 *
	 * 2) If user just clear the select (selectedNewAttribute = false)
	 *  +) clear existing select attribute values
	 */
	const handleAttributeSelectChange = (manifestIndex: number, selectedNewAttribute: boolean) => {
		manifestPerformFetchingAttributeValues[manifestIndex] = selectedNewAttribute;
		variantManifests[manifestIndex].values = [];
	};

	export const checkAttributeIsSwatch = (attributeId: string) => {
		return (
			$ProductTypeDetailQuery.data?.productType?.assignedVariantAttributes?.find(
				(attr) => attr.attribute.id === attributeId,
			)?.attribute.inputType === AttributeInputTypeEnum.Swatch
		);
	};

	const handleDeleteManifest = (manifestIdx: number) => {
		const currentNumberOfManifests = variantManifests.length;

		// 1) Remove the manifest
		variantManifests = variantManifests.filter((_, idx) => idx !== manifestIdx);
		if (!variantManifests.length) {
			onManifestDeleted();
			// return immediately
			return;
		}

		// 2) Trigger fetching attribute values again
		if (manifestIdx === 0 && currentNumberOfManifests === MAX_VARIANT_TYPES)
			manifestPerformFetchingAttributeValues[0] = true;

		onManifestDeleted();
	};

	// Right after the page mounted, we must check if there is metadata information of attributes used by variants.
	// If yes, perform parse that data, and apply it to `variantManifests`
	onMount(async () => {
		const attrMeta = privateMetadata.find(
			(item) => item.key === ProductPrivateMetadataVariantAttributeUsedKey,
		);
		if (attrMeta) {
			try {
				const parsedAttrInfor = JSON.parse(attrMeta.value);
				if (parsedAttrInfor.length) {
					variantManifests = parsedAttrInfor;

					// also trigger the <Select /> to fetch attribute values data
					manifestPerformFetchingAttributeValues = [true, true];
				}
			} catch (err) {
				toast.error(`Failed to load variant attribute information. Please try reload the page.`);
			}
		}
	});

	const handleAddNewAttributeValue = async (manifestIdx: number, value: string) => {
		const attributeId = variantManifests[manifestIdx].attribute.id;

		innerLoading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'attributeValueCreate'>,
			MutationAttributeValueCreateArgs
		>(ATTRIBUTE_VALUE_CREATE_MUTATION, {
			attribute: attributeId,
			input: {
				name: value,
				value: checkAttributeIsSwatch(attributeId) ? value : undefined,
			},
		});
		innerLoading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'attributeValueCreate',
				`Attribute value of '${value}' was created!`,
			)
		)
			return;

		// added value success, perform refetching now
		manifestPerformFetchingAttributeValues[manifestIdx] = true;
	};

	const handleVariantValuesChange = (
		manifestIdx: number,
		options?: SelectOption | SelectOption[],
	) => {
		variantManifests[manifestIdx].values = (options as SelectOption[]) || [];
		// trigger parent to recalculate its variants bulk input
		onVariantValuesChange();
		recalculateVariantAttributeMetadata();
	};
</script>

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
			<div class={SitenameCommonClassName}>
				<Select
					placeholder="Select an attribute"
					label="Variant #{idx + 1}"
					options={AvailableAttributeOptions}
					bind:value={manifest.attribute.id}
					disabled={ShouldDisable}
					onchange={(opt) => {
						if (opt) manifest.attribute.name = (opt as SelectOption).label;
						handleAttributeSelectChange(idx, !!opt);
					}}
				/>

				{#if manifest.attribute.id}
					{#key manifest.attribute.id}
						<GraphqlPaginableSelect
							disabled={ShouldDisable}
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
							bind:performDataFetching={manifestPerformFetchingAttributeValues[idx]}
							onNotFoundQuerySelected={(newValue) =>
								newValue && handleAddNewAttributeValue(idx, newValue)}
						/>
					{/key}
				{/if}

				<Button
					endIcon={Trash}
					size="sm"
					disabled={ShouldDisable}
					fullWidth
					variant="light"
					color="red"
					onclick={() => handleDeleteManifest(idx)}
				>
					{$T('product.delVariant')}
				</Button>
			</div>
		{/each}
		{#if variantManifests.length < MAX_VARIANT_TYPES && AvailableAttributeOptions.some((opt) => !opt.disabled)}
			<button
				class={[
					'border-dashed border w-full h-full flex items-center justify-center rounded-lg tooltip tooltip-top border-blue-500 text-blue-500 cursor-pointer py-5 hover:bg-blue-50 active:bg-blue-100 focus:bg-blue-50',
				]}
				onclick={handleAddVariantManifest}
				data-tip={$T('product.addVariant')}
				aria-label={$T('product.addVariant')}
				disabled={ShouldDisable}
			>
				<Icon icon={Plus} size="xl" />
			</button>
		{/if}
	</div>
{/if}
