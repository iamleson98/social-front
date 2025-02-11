<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import { MultiSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type AttributeValueInput,
		type Query,
		type QueryProductTypeArgs
	} from '$lib/gql/graphql';
	import { operationStore } from '$lib/api/operation';
	import { slide } from 'svelte/transition';
	import { tranFunc } from '$i18n';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { onMount } from 'svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { RequiredAt } from '$lib/components/ui';
	import ErrorMsg from './error-msg.svelte';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import Editor from '$lib/components/common/editorjs/editor.svelte';
	import Dayjs from 'dayjs';

	type CustomAttributeInput = AttributeValueInput & {
		required: boolean;
		inputType?: AttributeInputTypeEnum | null;
	};

	type Props = {
		productTypeID?: string | null;
		attributes: AttributeValueInput[];
		ok: boolean;
	};

	const MAX_FETCHING_BATCH = 100;
	let { productTypeID, attributes = $bindable([]), ok = $bindable() }: Props = $props();

	let prevproductTypeID = $state(productTypeID);
	let blurTriggers = $state<boolean[]>([]);

	const handleSwatchChange = (attrIdx: number, value: string) => {
		attributes = attributes.map((attr, idx) => {
			if (idx !== attrIdx) return attr;

			return {
				id: attr.id,
				swatch: {
					value
				}
			};
		});
	};

	/** asynchronously calculate attribute errors */
	let attributeErrors = $derived.by<(string | undefined)[]>(() => {
		const result = new Array(attributes.length).fill(undefined);
		const requiredErr = $tranFunc('helpText.fieldRequired');

		for (let idx = 0; idx < attributes.length; idx++) {
			const attr = attributes[idx];

			if (!attr['required' as keyof AttributeValueInput]) continue;

			if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Dropdown &&
				(!attr.dropdown || !Object.keys(attr.dropdown).length)
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Boolean &&
				typeof attr.boolean !== 'boolean'
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Date &&
				!attr.date
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Numeric &&
				!attr.numeric
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.DateTime &&
				!attr.dateTime
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Reference &&
				(!attr.references || !attr.references.length)
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.RichText &&
				!attr.richText
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.PlainText &&
				!attr.plainText
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Swatch &&
				(!attr.swatch || !Object.keys(attr.swatch).length)
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.File &&
				!attr.file
			) {
				result[idx] = requiredErr;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Multiselect &&
				(!attr.multiselect || !attr.multiselect.length)
			) {
				result[idx] = requiredErr;
			}
		}

		return result;
	});

	$effect(() => {
		ok = !attributeErrors.some(Boolean);
	});

	const productTypeQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		kind: 'query',
		query: PRODUCT_TYPE_QUERY,
		requestPolicy: 'network-only',
		variables: {
			id: productTypeID,
			attributeChoicesFirst: MAX_FETCHING_BATCH
		},
		pause: !productTypeID
	});

	onMount(() => {
		const unsub = productTypeQuery.subscribe((result) => {
			if (result.data?.productType?.productAttributes?.length) {
				blurTriggers = new Array(result.data.productType.productAttributes.length).fill(false);
				attributes = result.data.productType.productAttributes.map<CustomAttributeInput>(
					({ valueRequired, inputType, id }) => {
						const result: CustomAttributeInput = {
							required: valueRequired,
							inputType,
							id
						};

						if (inputType === AttributeInputTypeEnum.Dropdown) {
							result.dropdown = {};
						} else if (inputType === AttributeInputTypeEnum.Multiselect) {
							result.multiselect = [];
						} else if (inputType === AttributeInputTypeEnum.Swatch) {
							result.swatch = {};
						} else if (inputType === AttributeInputTypeEnum.Reference) {
							result.references = [];
						}
						return result;
					}
				);
			}
		});

		return unsub;
	});

	// listener when category id changes
	$effect(() => {
		if (productTypeID && productTypeID !== prevproductTypeID) {
			prevproductTypeID = productTypeID; // reassign prev state
			productTypeQuery.reexecute({
				variables: {
					...$productTypeQuery.operation.variables,
					id: productTypeID
				}
			});
		}
	});
</script>

<div class="hidden!"></div>

{#if productTypeID}
	<div class="mb-3">
		<RequiredAt class="text-sm" label={$tranFunc('product.tabAttributes')} required />

		<div
			class="rounded-lg border p-3 {blurTriggers.some(Boolean) && !ok
				? 'bg-red-50 border-red-200'
				: 'bg-gray-50 border-gray-200'}"
			transition:slide
		>
			{#if $productTypeQuery.fetching}
				<div class="flex items-center flex-wrap">
					{#each [null, null] as _}
						<div class="w-1/2">
							<SkeletonContainer class="w-full">
								<Skeleton class="w-3/4 h-2" />
							</SkeletonContainer>
						</div>
					{/each}
				</div>
			{:else if $productTypeQuery.error}
				<Alert variant="error" size="sm" bordered>
					{$productTypeQuery.error.message}
				</Alert>
			{:else if !$productTypeQuery.data?.productType?.productAttributes?.length}
				<Alert variant="info" size="sm" bordered>{$tranFunc('product.noAttributes')}</Alert>
			{:else if $productTypeQuery.data?.productType?.productAttributes}
				<div class="flex items-start flex-wrap">
					{#each $productTypeQuery.data?.productType?.productAttributes as node, idx (idx)}
						<div class="w-1/2 tablet:w-full p-1 shrink flex items-center mb-2">
							<div class="w-1/4 text-xs">
								<RequiredAt
									class="mr-1"
									required={node.valueRequired}
									pos="start"
									label={node.name || ''}
								/>
							</div>
							<div class="w-3/4">
								{#if node.inputType === AttributeInputTypeEnum.Dropdown && node.choices}
									{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
										value: id,
										label: name || id
									})) as SelectOption[]}
									<Select
										{options}
										size="sm"
										onchange={(opt) => {
											attributes = attributes.map((attr, i) => {
												if (i !== idx) return attr;

												if (opt)
													return {
														id: attr.id,
														dropdown: { id: opt.value as string }
													};

												return attr;
											});
										}}
										onblur={() => {
											blurTriggers[idx] = true;
										}}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Boolean}
									<Checkbox
										size="sm"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { id: attr.id, boolean: evt.currentTarget.checked } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Date}
									<EaseDatePicker
										size="sm"
										onchange={(value) => {
											attributes = attributes.map((attr, i) =>
												i === idx
													? { id: attr.id, date: Dayjs(value.date).format('YYYY-MM-DD') }
													: attr
											);
										}}
										timeConfig={false}
										allowSelectMonthYears={{ showMonths: true, showYears: { min: 2020 } }}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.File}
									<Input
										type="file"
										size="sm"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { id: attr.id, file: evt.currentTarget.files?.[0].name } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Numeric}
									<Input
										placeholder={$tranFunc('placeholders.valuePlaceholder')}
										size="sm"
										type="number"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { id: attr.id, numeric: evt.currentTarget.value } : attr
											);
										}}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.DateTime}
									<EaseDatePicker
										size="sm"
										onchange={(value) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { id: attr.id, dateTime: value.date } : attr
											);
										}}
										autoApply={false}
										allowSelectMonthYears={{ showMonths: true, showYears: { min: 2020 } }}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Reference}
									<div>ref</div>
								{:else if node.inputType === AttributeInputTypeEnum.RichText}
									<div>
										<Editor
											placeholder={$tranFunc('placeholders.valuePlaceholder')}
											onchange={(data) => {
												attributes = attributes.map((attr, i) =>
													i === idx ? { id: attr.id, richText: JSON.stringify(data) } : attr
												);
											}}
										/>
									</div>
								{:else if node.inputType === AttributeInputTypeEnum.PlainText}
									<Input
										size="sm"
										type="text"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { id: attr.id, plainText: evt.currentTarget.value } : attr
											);
										}}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Multiselect && node.choices}
									{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
										value: id,
										label: name || id
									})) as SelectOption[]}
									<MultiSelect
										{options}
										size="sm"
										value={[]}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Swatch}
									<div class="flex items-center gap-2 flex-wrap flex-row">
										{#each node.choices?.edges || [] as edge, sid (sid)}
											<div class="tooltip tooltip-top" data-tip={edge.node.name}>
												<div
													class="w-9 h-9 rounded bg-gray-200 flex items-center justify-center"
													style="background-color: {edge.node.value}"
												>
													<input
														type="radio"
														class="radio radio-xs"
														value={edge.node.value}
														checked={edge.node.value === attributes[idx]?.swatch?.value}
														onchange={(evt) => handleSwatchChange(idx, edge.node.value)}
													/>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<ErrorMsg
			error={blurTriggers.some(Boolean) && !ok ? $tranFunc('error.thereIsError') : undefined}
		/>
	</div>
{/if}
