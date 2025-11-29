<script lang="ts" module>
	// defined as const to make it easier to use
	export const ChannelListingExistingKey =
		'existing' as keyof ProductVariantChannelListingUpdateInput;
	export const ChannelListingCurrentKey =
		'current' as keyof ProductVariantChannelListingUpdateInput;

	export const StockExistingKey = 'existing' as keyof ProductVariantStocksUpdateInput;
	export const StockCurrentKey = 'current' as keyof ProductVariantStocksUpdateInput;

	export const StockWarehouseNameKey = 'warehouseName' as keyof ProductVariantStocksUpdateInput;
</script>

<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_VALUE_CREATE_MUTATION } from '$lib/api/admin/attribute';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Icon, Plus } from '$lib/components/icons';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type Channel,
		type MetadataInput,
		type Mutation,
		type MutationAttributeValueCreateArgs,
		type ProductChannelListingAddInput,
		type ProductChannelListingUpdateInput,
		type ProductVariantBulkUpdateInput,
		type ProductVariantChannelListing,
		type ProductVariantChannelListingUpdateInput,
		type ProductVariantStocksUpdateInput,
		type Query,
		type QueryProductTypeArgs,
		type Stock,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import {
		ProductPrivateMetadataVariantAttributeUsedKey,
		type ChannelSelectOptionProps,
		type QuickFillingProps,
		type VariantManifest,
	} from './utils';
	import VariantManifestItem from './variant-manifest-item.svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	type Props = {
		disabled?: boolean;
		/** This is provided by the channel listing selector section */
		channelsListing: ProductChannelListingUpdateInput;
		productVariantsInput: ProductVariantBulkUpdateInput[];
		privateMetadata: MetadataInput[];
		productTypeId: string;
	};

	let {
		disabled,
		productVariantsInput = $bindable(),
		privateMetadata = $bindable(),
		channelsListing,
		productTypeId,
	}: Props = $props();

	const ProductTypeDetailQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		variables: {
			id: productTypeId,
		},
		requestPolicy: 'cache-and-network',
		pause: !productTypeId,
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

	let variantManifests = $state<VariantManifest[]>([]);
	let channelSelectOptions = $state.raw<ChannelSelectOptionProps[]>([]);
	let quickFillingValues = $state<QuickFillingProps>({
		channels: [],
		stocks: [],
		preOrder: {},
		weight: 0,
		trackInventory: true,
	});
	let loading = $state(false);
	/**
	 * there are at most 2 attributes used for variants creation, so this list has 2 booleans.
	 * If user can not find her desired attribute values, we support auto create feature,
	 * so user do not have to visit the attribute detail page to add more values.
	 *
	 * With that said, after an attribute value is added, we must use this list, to trigger according select to refetch and find for created attribute values.
	 */
	let manifestPerformFetchingAttributeValues = $state([false, false]);

	const MAX_VARIANT_TYPES = 2;
	const MIN_DAYS_FOR_PREORDER = 5;
	const MAX_DAYS_FOR_PREORDER = 15;
	const DAYJS_NOW = dayjs();

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

					// also update the variant details
					// variantManifests.forEach((item, idx) => handleVariantValuesChange(idx, item.values));
				}
			} catch (err) {
				console.error(err);
				toast.error(`Failed to load variant attribute information. Please try reload the page.`);
			}
		}
	});

	$effect(() => {
		// when the given channels change, this function runs again,
		// we must do these steps below, to make sure the logic works:

		// 1) Update the logic for the channel select options
		const newChannelSelectOptions: ChannelSelectOptionProps[] = [];
		const channelIdsMap: Record<string, boolean> = {};

		channelsListing?.updateChannels?.forEach((channelListing) => {
			newChannelSelectOptions.push({
				value: channelListing.channelId,
				label: channelListing['channelName' as keyof ProductChannelListingAddInput],
				currency: channelListing['currency' as keyof ProductChannelListingAddInput],
				channelId: channelListing.channelId,
				price: undefined,
			});

			channelIdsMap[channelListing.channelId] = true;
		});

		channelSelectOptions = newChannelSelectOptions;

		if (quickFillingValues.channels.some((chan) => !channelIdsMap[chan.channelId]))
			// 2) In case user already selected channels for some variant(s),
			// we must check and keep them in sync with new selected channels.

			// a) quick filling section
			quickFillingValues.channels = quickFillingValues.channels.filter(
				(chan) => channelIdsMap[chan.channelId],
			);

		// if (
		// 	variantsInputDetails.some((inputDetail) =>
		// 		inputDetail.channelListings?.some((listing) => !channelIdsMap[listing.channelId]),
		// 	)
		// )
		// 	// b) variant detail sections
		// 	variantsInputDetails = variantsInputDetails.map((inputDetail) => {
		// 		inputDetail.channelListings = inputDetail.channelListings?.filter(
		// 			(chan) => channelIdsMap[chan.channelId],
		// 		);

		// 		return inputDetail;
		// 	});
	});

	/**
	 * If there is 1 variant, there will be 8 columns -> each column's width = 1/9 = 11.11%, 2 variants -> 9 columns -> each column's width = 1/8 = 12.5%;
	 */
	const ThClass = $derived.by(() => {
		if (!variantManifests.length) return '';
		if (variantManifests.length === 1) return 'w-[12.5%]!';
		return 'w-[11.11%]!';
	});

	const handleAddNewAttributeValue = async (manifestIdx: number, value: string) => {
		const attributeId = variantManifests[manifestIdx].attribute.id;
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
		manifestPerformFetchingAttributeValues[manifestIdx] = true;
	};

	const handleDeleteVariant = (variantIdx: number) => {
		const currentNumberOfManifests = variantManifests.length;

		// remove the manifest
		variantManifests = variantManifests.filter((_, idx) => idx !== variantIdx);
		if (!variantManifests.length) {
			// variantsInputDetails = [];
			return;
		}

		// trigger fetching attribute values again
		if (variantIdx === 0 && currentNumberOfManifests === MAX_VARIANT_TYPES)
			manifestPerformFetchingAttributeValues[0] = true;

		// update the variants input details
		// variantsInputDetails = variantManifests[0].values.map((value) => {
		// 	const isSwatchAttribute = checkAttributeIsSwatch(variantManifests[0].attribute.id);
		// 	const attributeProp: BulkAttributeValueInput = {
		// 		id: variantManifests[0].attribute.id,
		// 	};

		// 	if (isSwatchAttribute) set(attributeProp, 'swatch.value', value.value);
		// 	else set(attributeProp, 'dropdown.value', value.value);

		// 	return {
		// 		attributes: [attributeProp],
		// 		name: `${value.value}`,
		// 		sku: `${value.value}`,
		// 		trackInventory: true,
		// 		channelListings: [],
		// 		weight: 0,
		// 		preorder: {},
		// 	};
		// });
	};

	const handleVariantValuesChange = (
		manifestIdx: number,
		options?: SelectOption | SelectOption[],
	) => {};

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
		if (!variantManifests.length) manifestPerformFetchingAttributeValues[0] = true;
		else manifestPerformFetchingAttributeValues[1] = true;

		variantManifests = variantManifests.concat({
			attribute: {
				id: '',
				name: '',
			},
			values: [],
		});

		recalculateVariantAttributeMetadata();
	};
</script>

<div class="grid grid-cols-2 gap-2">
	{#each variantManifests as maniFest, idx (idx)}
		<VariantManifestItem
			index={idx}
			bind:manifest={variantManifests[idx]}
			onDeleteVariant={handleDeleteVariant}
			onAttributeValuesChange={handleVariantValuesChange}
			onSelectAddNewAttributeValue={handleAddNewAttributeValue}
			attributeOptions={AvailableAttributeOptions}
			bind:performFetchAttributeValues={manifestPerformFetchingAttributeValues[idx]}
		/>
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

<div class={SitenameCommonClassName}>
	<table class="w-full text-sm h-fit text-left table text-gray-600">
		<thead>
			<tr>
				<th class={ThClass}>{variantManifests[0]?.attribute?.name}</th>
				{#if variantManifests.length === MAX_VARIANT_TYPES}
					<th class={ThClass}>{variantManifests[1]?.attribute?.name}</th>
				{/if}
				<th class={ThClass}>{$tranFunc('product.channel')}</th>
				<th class={ThClass}>{$tranFunc('product.price')}</th>
				<th class={ThClass}>{$tranFunc('product.costPrice')}</th>
				<th class={ThClass}>{$tranFunc('attributes.Weight')}</th>
				<th class={ThClass}>{$tranFunc('common.preorder')}</th>
				<th class={ThClass}>{$tranFunc('product.stock')}</th>
				<th class={ThClass}>{$tranFunc('product.sku')}</th>
			</tr>
		</thead>
		<tbody>
			{#each productVariantsInput as variantInputDetail, detailIdx (detailIdx)}
				<tr class={`variant-table-row border-b border-gray-200`}>
					{#if variantManifests.length === MAX_VARIANT_TYPES}
						{#if detailIdx % variantManifests[1].values.length === 0}
							<td
								class={['text-center font-medium text-blue-600 bg-blue-50']}
								rowspan={variantManifests[1].values.length}
							>
								{variantInputDetail.name?.split('-')[0]}
							</td>
						{/if}
						<td class="text-center">{variantInputDetail.name?.split('-')[1]}</td>
					{:else}
						<td class="text-center">
							<dir>{variantInputDetail.name?.split('-')[0]}</dir>
						</td>
					{/if}
					<!-- CHANNELS -->
					<td class="channel-td max-w-3xs min-w-28">
						{#if !channelSelectOptions?.length}
							<SelectSkeleton size="sm" />
						{:else}
							{@const currentChannelIds =
								variantInputDetail.channelListings?.[ChannelListingCurrentKey]?.map(
									(item) => (item as any).channel.id,
								) || []}

							<Select
								size="sm"
								{disabled}
								options={channelSelectOptions}
								value={currentChannelIds}
								multiple
								onchange={(opts) => {
									const selectedOptions = (
										!opts || !Array.isArray(opts) || !opts.length ? [] : opts
									) as ChannelSelectOptionProps[];

									variantInputDetail.channelListings![ChannelListingCurrentKey] =
										selectedOptions.map<ProductVariantChannelListing>((opt) => ({
											channelId: opt.value as string,
											costPrice: {
												currency: opt.currency,
												amount: 0,
												fractionDigits: 0,
												fractionalAmount: 0,
											},
											price: {
												currency: opt.currency,
												amount: 0,
												fractionDigits: 0,
												fractionalAmount: 0,
											},

											id: null as unknown as string,
											channel: null as unknown as Channel,
										})) as any;
								}}
							/>
						{/if}
					</td>
					<!-- PRICE -->
					<td class="price-td">
						<div class="space-y-1">
							{#each variantInputDetail.channelListings?.[ChannelListingCurrentKey] as unknown as ProductVariantChannelListing[] as channelListing, idx (idx)}
								<Input
									type="number"
									min={0}
									{disabled}
									size="xs"
									placeholder={channelListing.channel.currencyCode}
									bind:value={channelListing.price!.amount}
									variant={channelListing.price!.amount < 0 ? 'error' : 'info'}
									subText={channelListing.price!.amount < 0 ? $CommonState.NonNegativeError : ''}
								></Input>
							{/each}
						</div>
					</td>
					<!-- COST PRICE -->
					<td class="cost-price-td">
						<div class="space-y-1">
							{#each variantInputDetail.channelListings?.[ChannelListingCurrentKey] as unknown as ProductVariantChannelListing[] as channelListing, idx (idx)}
								<Input
									type="number"
									min={0}
									{disabled}
									size="xs"
									placeholder={channelListing.channel.currencyCode}
									bind:value={channelListing.costPrice!.amount}
									variant={channelListing.costPrice!.amount < 0 ? 'error' : 'info'}
									subText={channelListing.costPrice!.amount < 0
										? $CommonState.NonNegativeError
										: ''}
								></Input>
							{/each}
						</div>
					</td>
					<!-- WEIGHT -->
					<td class="weight-td">
						<Input
							type="number"
							size="sm"
							min={0}
							placeholder="kg"
							{disabled}
							bind:value={variantInputDetail.weight!.value}
							variant={variantInputDetail.weight!.value >= 0 ? 'info' : 'error'}
							subText={variantInputDetail.weight!.value >= 0 ? '' : $CommonState.NonNegativeError}
						>
							{#snippet action()}
								<span class="text-[10px] font-semibold">kg</span>
							{/snippet}
						</Input>
					</td>
					<!-- PREORDER -->
					<td class="preorder-td">
						<Input
							type="number"
							min={0}
							label={$tranFunc('product.qtyLimit')}
							size="xs"
							class="mb-2"
							{disabled}
							bind:value={variantInputDetail.preorder!.globalThreshold}
							variant={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
							variantInputDetail.preorder.globalThreshold % 1 !== 0
								? 'error'
								: 'info'}
							subText={typeof variantInputDetail.preorder?.globalThreshold === 'number' &&
							variantInputDetail.preorder.globalThreshold % 1 !== 0
								? $CommonState.NonNegativeError
								: undefined}
						/>
						<EaseDatePicker
							size="xs"
							label={$tranFunc('product.preOrderEndDate')}
							allowSelectMonthYears={{
								showMonths: true,
								showYears: { min: 2020, max: DAYJS_NOW.year() + 1 },
							}}
							{disabled}
							timeConfig={false}
							onchange={(date) => (variantInputDetail.preorder!.endDate = date.date)}
							value={{ date: variantInputDetail.preorder!.endDate }}
							class="mb-2"
							timeLock={{
								minDate: DAYJS_NOW.add(MIN_DAYS_FOR_PREORDER, 'day').toDate(),
								maxDate: DAYJS_NOW.add(MAX_DAYS_FOR_PREORDER, 'day').toDate(),
							}}
						/>
					</td>
					<!-- STOCK -->
					<td class="stock-td">
						<div class="space-y-1 max-h-28 overflow-y-auto p-0.5">
							{#each variantInputDetail.stocks?.[StockCurrentKey] as unknown as Stock[] as stock, idx (idx)}
								<Input
									size="xs"
									label={stock.warehouse.name}
									placeholder={$tranFunc('product.stock')}
									bind:value={stock.quantity}
									type="number"
									{disabled}
									min={0}
									variant={stock.quantity % 1 !== 0 ? 'error' : 'info'}
									subText={stock.quantity % 1 !== 0 ? $CommonState.NonNegativeError : ''}
								/>
							{/each}
						</div>
					</td>
					<!-- SKU -->
					<td class="sku-td">
						<Input
							type="text"
							size="sm"
							{disabled}
							placeholder="SKU"
							bind:value={variantInputDetail.sku}
							variant={variantInputDetail.sku?.trim() ? 'info' : 'error'}
							subText={variantInputDetail.sku?.trim() ? '' : $CommonState.FieldRequiredError}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	th:not(:last-child) {
		@apply border-r border-gray-200 py-1 px-1.5;
	}

	tr {
		@apply border-b border-gray-300;
	}

	tr:nth-child(even) {
		@apply bg-gray-50;
	}

	td {
		@apply p-1;
	}
</style>
