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
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import { onMount } from 'svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import ErrorMsg from './error-msg.svelte';
	import { PRODUCT_TYPE_QUERY } from '$lib/api/admin/product';
	import Editor from '$lib/components/common/editorjs/editor.svelte';
	import Dayjs from 'dayjs';
	import { omit } from 'es-toolkit';

	type CustomAttributeInput = AttributeValueInput & {
		required: boolean;
		inputType?: AttributeInputTypeEnum | null;
	};

	type Props = {
		productTypeID?: string | null;
		attributes: AttributeValueInput[];
		ok: boolean;
		loading: boolean;
	};

	const MAX_FETCHING_BATCH = 100;
	let { productTypeID, attributes = $bindable([]), ok = $bindable(), loading }: Props = $props();

	let prevproductTypeID = $state(productTypeID);
	let blurTriggers = $state<boolean[]>([]);
	let innerAttributes = $state<CustomAttributeInput[]>([]);

	/** asynchronously calculate attribute errors */
	let attributeErrors = $derived.by<(string | undefined)[]>(() => {
		const result = new Array(innerAttributes.length).fill(undefined);
		const requiredErr = $tranFunc('helpText.fieldRequired');

		for (let idx = 0; idx < innerAttributes.length; idx++) {
			const attr = innerAttributes[idx];

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
		if (ok) {
			attributes = innerAttributes.map<AttributeValueInput>((attr) =>
				omit(attr, ['inputType', 'required'])
			);
		}
	});

	const productTypeQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		kind: 'query',
		query: PRODUCT_TYPE_QUERY,
		requestPolicy: 'cache-and-network',
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
				innerAttributes = result.data.productType.productAttributes.map<CustomAttributeInput>(
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
		<Label required requiredAtPos="end" label={$tranFunc('product.tabAttributes')} />

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
								<Label
									required={node.valueRequired}
									size="sm"
									requiredAtPos="start"
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
										disabled={loading}
										onchange={(opt) => {
											innerAttributes = innerAttributes.map((attr, i) => {
												if (i !== idx) return attr;

												return {
													...attr,
													dropdown: opt ? { id: opt.value as string } : undefined
												};
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
										disabled={loading}
										onchange={(evt) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, boolean: evt.currentTarget.checked } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Date}
									<EaseDatePicker
										size="sm"
										disabled={loading}
										onchange={(value) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, date: Dayjs(value.date).format('YYYY-MM-DD') } : attr
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
										disabled={loading}
										onchange={(evt) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, file: evt.currentTarget.files?.[0].name } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Numeric}
									<Input
										placeholder={$tranFunc('placeholders.valuePlaceholder')}
										size="sm"
										type="number"
										disabled={loading}
										onchange={(evt) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, numeric: evt.currentTarget.value } : attr
											);
										}}
										onblur={() => (blurTriggers[idx] = true)}
										variant={blurTriggers[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={blurTriggers[idx] ? attributeErrors[idx] : undefined}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.DateTime}
									<EaseDatePicker
										size="sm"
										disabled={loading}
										onchange={(value) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, dateTime: value.date } : attr
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
									<!-- NOTE: we cannot disable editorJs for now -->
									<div>
										<Editor
											placeholder={$tranFunc('placeholders.valuePlaceholder')}
											onchange={(data) => {
												innerAttributes = innerAttributes.map((attr, i) =>
													i === idx ? { ...attr, richText: JSON.stringify(data) } : attr
												);
											}}
										/>
									</div>
								{:else if node.inputType === AttributeInputTypeEnum.PlainText}
									<Input
										size="sm"
										type="text"
										onchange={(evt) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, plainText: evt.currentTarget.value } : attr
											);
										}}
										onblur={() => (blurTriggers[idx] = true)}
										disabled={loading}
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
										disabled={loading}
										onchange={(values) => {
											innerAttributes = innerAttributes.map((attr, i) => {
												if (i !== idx || !values) return attr;
												return {
													...attr,
													multiselect: values.map((vl) => ({
														value: `${vl.value}`
													}))
												};
											});
										}}
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
														disabled={loading}
														class="radio radio-xs"
														value={edge.node.value}
														checked={edge.node.value === innerAttributes[idx]?.swatch?.value}
														onchange={(evt) => {
															innerAttributes = innerAttributes.map((attr, i) => {
																if (i !== idx) return attr;

																return {
																	...attr,
																	swatch: {
																		value: evt.currentTarget.value
																	}
																};
															});
														}}
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
