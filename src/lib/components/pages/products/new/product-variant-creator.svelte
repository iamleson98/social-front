<script lang="ts">
	import { tClient } from '$i18n';
	import { Plus, Trash, type IconType } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { type SocialColor } from '$lib/components/ui/common';
	import { Input } from '$lib/components/ui/Input';
	import { MultiSelect } from '$lib/components/ui/select';
	import type { ProductVariantBulkCreateInput, Query } from '$lib/gql/graphql';
	import { CHANNELS_QUERY_STORE } from '$lib/stores/api/channels';
	import { operationStore } from '$lib/stores/api/operation';
	import { preHandleGraphqlResult, randomString } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { chunk, flatten } from 'lodash-es';

	type VariantManifestProps = {
		name: {
			value: string;
			error?: string;
		};
		values: {
			value: string;
			error?: string;
		}[];
	};
	type variantAction = (variantIdx: number) => void;
	type QuickFillHighlight = 'td-channel-hl' | 'td-price-hl' | 'td-stock-hl' | 'td-sku-hl';

	const MAX_VARIANT_TYPES = 2;
	const MAX_VALUES_PER_VARIANT = 4;

	const DEFAULT_VARIANTS: VariantManifestProps[] = [
		{
			name: {
				value: 'color'
			},
			values: [
				{
					value: 'red'
				}
			]
		}
	];

	let quickFillingHighlight = $state<QuickFillHighlight>();
	let variantManifests = $state.raw<VariantManifestProps[]>(DEFAULT_VARIANTS);
	/** details of product variants, before sending to backend */
	let variantDetails = $state<ProductVariantBulkCreateInput[]>([
		{
			name: DEFAULT_VARIANTS[0].values[0].value,
			attributes: [],
			sku: `${randomString()}-${DEFAULT_VARIANTS[0].values[0].value}`,
			trackInventory: true
		}
	]);
	/** indicates if there is error in any of the variant values, names */
	let generalError = $state(false);

	const channelsQueryStore = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		query: CHANNELS_QUERY_STORE,
		context: { requestPolicy: 'cache-and-network' }
	});
	// onMount(() => channelsQueryStore.subscribe(preHandleGraphqlResult))

	const handleFocusQuickFilling = (highlight?: QuickFillHighlight) => {
		quickFillingHighlight = highlight;
	};

	const handleVariantValueChange = (variantIdx: number, valueIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const newValue = (evt.target as HTMLInputElement).value;
		const valueTrimLower = newValue.trim().toLowerCase();

		const valueDuplicate = variantManifests[variantIdx].values.some(
			(value, idx) => idx !== valueIdx && valueTrimLower && valueTrimLower === value.value
		);

		generalError = !valueTrimLower || valueDuplicate;
		variantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: variant.name,
				values: variant.values.map((value, idx) => {
					if (idx !== valueIdx) return value;

					return {
						value: valueTrimLower,
						error: valueDuplicate
							? tClient('product.variantValueExist', { name: valueTrimLower })
							: !newValue
								? tClient('product.variantValueEmpty')
								: undefined
					};
				})
			};
		});

		if (generalError) return;

		if (variantManifests.length === 1) {
			variantDetails = variantDetails.map((detail, idx) => {
				if (idx !== valueIdx) return detail;

				return {
					...detail,
					name: valueTrimLower,
					sku: `${randomString()}-${valueTrimLower}`
				};
			});

			return;
		}

		const newVariantDetails = [...variantDetails];

		if (variantIdx === 0) {
			let index = valueIdx * variantManifests[1].values.length;
			const endIndex = (valueIdx + 1) * variantManifests[1].values.length;

			for (; index < endIndex; index++) {
				const existingValue = variantDetails[index];
				const splitName = (existingValue.name || '-').split('-');
				const newSku = `${randomString()}-${valueTrimLower}-${splitName[1]}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${valueTrimLower}-${splitName[1]}`,
					sku: newSku
				};
			}
		} else {
			for (
				let index = valueIdx;
				index < variantDetails.length;
				index += variantManifests[1].values.length
			) {
				const existingValue = variantDetails[index];
				const splitName = (existingValue.name || '-').split('-');
				const newSku = `${randomString()}-${splitName[0]}-${valueTrimLower}`;

				newVariantDetails[index] = {
					...existingValue,
					name: `${splitName[0]}-${valueTrimLower}`,
					sku: newSku
				};
			}
		}

		variantDetails = newVariantDetails;
	};

	const handleVariantNameChange = (variantIdx: number) => (evt: Event) => {
		if (!evt.target) return;
		const name = (evt.target as HTMLInputElement).value;
		const nameTrimLower = name.trim().toLowerCase();

		const nameDuplicate = variantManifests.some(
			(variant, idx) =>
				idx !== variantIdx &&
				nameTrimLower &&
				nameTrimLower === variant.name.value.trim().toLocaleLowerCase()
		);

		generalError = nameDuplicate || !nameTrimLower;
		const newVariants = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx) return variant;

			return {
				name: {
					value: nameTrimLower,
					error: nameDuplicate
						? tClient('product.variantNameExist', { name: nameTrimLower })
						: !name
							? tClient('product.variantNameEmpty')
							: undefined
				},
				values: variant.values
			};
		});

		variantManifests = newVariants;
	};

	const handleAddVariant = () => {
		if (variantManifests.length >= MAX_VARIANT_TYPES) return;

		if (!variantManifests.length) {
			variantManifests = DEFAULT_VARIANTS;
			variantDetails = DEFAULT_VARIANTS.map((variant) => ({
				name: variant.values[0].value,
				attributes: [],
				sku: `${randomString()}-${variant.values[0].value}`,
				trackInventory: true
			}));
			return;
		}

		const newVariants = variantManifests.concat({
			name: {
				value: 'size'
			},
			values: [
				{
					value: 'm'
				}
			]
		});

		const newVariantDetails = [];
		for (const variant1 of newVariants[0].values) {
			for (const variant2 of newVariants[1].values) {
				newVariantDetails.push({
					name: `${variant1.value}-${variant2.value}`,
					attributes: [],
					sku: `${randomString()}-${variant1.value}-${variant2.value}`,
					trackInventory: true
				});
			}
		}

		variantManifests = newVariants;
		variantDetails = newVariantDetails;
	};

	const handleDeleteVariant: variantAction = (variantIdx: number) => {
		if (!variantManifests.length) return;

		variantManifests = variantManifests.filter((_, idx) => idx !== variantIdx);
		if (!variantManifests.length) return;

		variantDetails = variantManifests[0].values.map((value) => ({
			name: `${value.value}`,
			attributes: [],
			sku: `${randomString()}-${value.value}`,
			trackInventory: true
		}));
	};

	const handleAddVariantValue: variantAction = (variantIdx: number) => {
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIdx || variant.values.length >= MAX_VALUES_PER_VARIANT) return variant;

			return {
				name: variant.name,
				values: variant.values.concat({ value: '' })
			};
		});

		if (newVariantManifests.length === 1) {
			variantDetails = variantDetails.concat({
				attributes: [],
				name: '-',
				sku: `${randomString()}-`,
				trackInventory: true
			});
		} else {
			if (variantIdx === 1) {
				const chunks = chunk(variantDetails, variantManifests[1].values.length);

				for (let i = 0; i < chunks.length; i++) {
					const siblingValue = chunks[i][0].name || '-';
					const siblingSplitName = siblingValue.split('-');

					chunks[i].push({
						attributes: [],
						name: `${siblingSplitName[0]}-`,
						sku: `${randomString()}-${siblingSplitName[0]}-`,
						trackInventory: true
					});
				}
				variantDetails = flatten(chunks);
			} else {
				const addingVariants = variantManifests[1].values.map((value) => ({
					attributes: [],
					name: `-${value.value}`,
					sku: `${randomString()}--${value.value}`,
					trackInventory: true
				}));
				variantDetails = variantDetails.concat(addingVariants);
			}
		}
		variantManifests = newVariantManifests;
	};

	const handleDeleteValue = (variantIndex: number, valueIndex: number) => {
		const newVariantManifests = variantManifests.map((variant, idx) => {
			if (idx !== variantIndex) return variant;

			return {
				name: variant.name,
				values: variant.values.filter((_, idx) => idx !== valueIndex)
			};
		});

		if (variantIndex === 0) {
			const beginIndex = valueIndex * variantManifests[1].values.length;
			const endIndex = (valueIndex + 1) * variantManifests[1].values.length;

			variantDetails = variantDetails.filter((_, idx) => idx < beginIndex || idx >= endIndex);
		} else {
			variantDetails = variantDetails.filter(
				(_, idx) => idx % variantManifests[1].values.length !== valueIndex
			);
		}

		variantManifests = newVariantManifests;
	};
</script>

{#snippet variantActionButton(
	tip: string,
	variantIdx: number,
	onclick: variantAction,
	disabled: boolean,
	color: SocialColor,
	text: string,
	endIcon: IconType
)}
	<div class="tooltip grow shrink" data-tip={tip}>
		<Button
			{disabled}
			onclick={() => onclick(variantIdx)}
			variant="light"
			{color}
			fullWidth
			size="sm"
			{endIcon}
		>
			{text}
		</Button>
	</div>
{/snippet}

<!-- composer -->
<div
	class="flex gap-2 mobile-l:flex-wrap flex-nowrap bg-gray-50 rounded-lg border border-gray-200 p-3"
	class:items-center={variantManifests.length < MAX_VARIANT_TYPES}
>
	{#each variantManifests as variant, variantIdx (variantIdx)}
		<div class="p-3 w-1/2 mobile-l:w-full border rounded-lg bg-white h-fit">
			<!-- title -->
			<div class="mb-1 text-xs">
				{tClient('product.variant')}
				{variantIdx + 1}
			</div>
			<!-- name -->
			<div class="mb-4">
				<label
					class="input input-sm flex items-center gap-2"
					class:input-error={!!variant.name.error}
				>
					<span>{tClient('product.variantName')}</span>
					<Input
						type="text"
						class="w-full"
						placeholder={tClient('product.variantPlaceholder')}
						inputDebounceOption={{
							onInput: handleVariantNameChange(variantIdx) as (result: unknown) => void
						}}
						value={variant.name.value}
						size="md"
						variant={variant.name.error ? 'error' : 'info'}
						subText={variant.name.error}
					/>
				</label>
			</div>

			<!-- values -->
			{#each variant.values as value, valueIdx (valueIdx)}
				<div class="mb-2" transition:slide>
					<div class="flex items-center justify-between">
						<Input
							variant={value.error ? 'error' : 'info'}
							type="text"
							class="w-4/5"
							size="sm"
							placeholder={tClient('product.valuePlaceholder')}
							inputDebounceOption={{
								onInput: handleVariantValueChange(variantIdx, valueIdx) as (
									result: unknown
								) => void,
								debounceTime: 500 // only fire after 0.5 sec after user stop typing
							}}
							value={value.value}
							subText={value.error}
						/>
						{#if variant.values.length > 1}
							<IconButton
								icon={Trash}
								size="xs"
								variant="light"
								rounded
								color="red"
								onclick={() => handleDeleteValue(variantIdx, valueIdx)}
								title={tClient('product.delValue')}
							/>
						{/if}
					</div>
				</div>
			{/each}
			<div class="flex justify-center items-center gap-1.5 mt-4">
				{@render variantActionButton(
					tClient('product.delVariant'),
					variantIdx,
					handleDeleteVariant,
					false,
					'red',
					'',
					Trash
				)}
				{@render variantActionButton(
					tClient('product.addValue'),
					variantIdx,
					handleAddVariantValue,
					variant.values.length >= MAX_VALUES_PER_VARIANT,
					'blue',
					`${variantManifests[variantIdx].values.length}/${MAX_VALUES_PER_VARIANT}`,
					Plus
				)}
			</div>
		</div>
	{/each}
	{#if variantManifests.length < MAX_VARIANT_TYPES}
		<div class="w-1/2 mobile-l:w-full">
			<div
				class="tooltip w-full h-full flex items-center justify-center"
				data-tip={tClient('product.addVariant')}
			>
				<IconButton
					onclick={handleAddVariant}
					icon={Plus}
					size="xl"
					variant="outline"
					color="blue"
				/>
			</div>
		</div>
	{/if}
</div>

{#if variantManifests.length && !generalError}
	<div class="mt-10">
		<!-- quick filling -->
		<div class="mb-4">
			<div class="text-xs mb-1">Quick filling</div>
			<div class="flex gap-x-2 items-center flex-row w-full">
				<MultiSelect
					disabled={$channelsQueryStore.fetching || !!$channelsQueryStore.error}
					size="sm"
					options={$channelsQueryStore.data?.channels?.map((channel) => ({
						value: channel.slug,
						label: channel.name
					})) || []}
					onfocus={() => handleFocusQuickFilling('td-channel-hl')}
					onblur={() => handleFocusQuickFilling()}
					value={[]}
				/>
				<!-- <Input
					type="text"
					placeholder="price"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-price-hl')}
					onblur={() => handleFocusQuickFilling()}
				/> -->
				<Input
					type="text"
					placeholder="stock"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-stock-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Input
					type="text"
					placeholder="SKU"
					size="sm"
					onfocus={() => handleFocusQuickFilling('td-sku-hl')}
					onblur={() => handleFocusQuickFilling()}
				/>
				<Button class="btn btn-sm grow shrink" size="sm">Apply</Button>
			</div>
		</div>

		<!-- details -->
		<div class="relative overflow-x-auto rounded-lg p-3 border border-gray-200 bg-gray-50">
			<table class="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-500 mb-4">
				<thead class="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
					<tr>
						<th>{variantManifests[0].name.value}</th>
						{#if variantManifests.length === MAX_VARIANT_TYPES}
							<th>{variantManifests[1].name.value}</th>
						{/if}
						<th>channel</th>
						<th>price</th>
						<th>stock</th>
						<th>classify sku</th>
					</tr>
				</thead>
				<tbody class="overflow-y-visible">
					{#each variantDetails as detail, detailIdx (detailIdx)}
						<tr class={`variant-table-row ${quickFillingHighlight}`}>
							<td class="text-center">{detail.name?.split('-')[0]}</td>
							{#if variantManifests.length === MAX_VARIANT_TYPES}
								<td class="text-center">{detail.name?.split('-')[1]}</td>
							{/if}
							<td class="channel-td">
								<MultiSelect
									size="xs"
									options={$channelsQueryStore.data?.channels?.map((channel) => ({
										value: channel.slug,
										label: channel.name
									})) || []}
									placeholder="Select channel"
									disabled={$channelsQueryStore.fetching || !!$channelsQueryStore.error}
									value={[]}
								/>
							</td>
							<td class="price-td">
								<Input type="text" size="xs" placeholder="price" />
							</td>
							<td class="stock-td">
								<Input type="text" size="xs" placeholder="stock" />
							</td>
							<td class="sku-td">
								<Input type="text" size="xs" placeholder="SKU" value={detail.sku} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- document -->
			<Alert variant="info" size="sm" bordered>
				<div class="text-xs">
					<p>- Choose a channel you would like to sell this product.</p>
					<p>- Provide pricing information for product variants</p>
					<p>- Provide stock information for product variants</p>
					<p>- Fill the classify sku for each product variant.</p>
				</div>
			</Alert>
		</div>
	</div>
{/if}

<style>
	@import 'tailwindcss/theme';

	td {
		@apply p-1;
	}
	th {
		@apply px-1 py-3;
	}
	/* highlight price */
	.variant-table-row.td-price-hl .price-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-price-hl:first-child > .price-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-price-hl:last-child > .price-td {
		@apply border-b border-blue-500;
	}

	/* highlight channel */
	.variant-table-row.td-channel-hl .channel-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-channel-hl:first-child > .channel-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-channel-hl:last-child > .channel-td {
		@apply border-b border-blue-500;
	}

	/* highlight stock */
	.variant-table-row.td-stock-hl .stock-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-stock-hl:first-child > .stock-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-stock-hl:last-child > .stock-td {
		@apply border-b border-blue-500;
	}

	/* highlight sku */
	.variant-table-row.td-sku-hl .sku-td {
		@apply border-l border-r border-blue-500;
	}
	.variant-table-row.td-sku-hl:first-child > .sku-td {
		@apply border-t border-blue-500;
	}
	.variant-table-row.td-sku-hl:last-child > .sku-td {
		@apply border-b border-blue-500;
	}
</style>
