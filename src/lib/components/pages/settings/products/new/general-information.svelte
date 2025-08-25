<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPE_QUERY, PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import {
		AttributeInputTypeEnum,
		type AttributeValueInput,
		type Query,
		type QueryProductTypeArgs,
		type QueryProductTypesArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { THIS_TIME_LAST_5_YEARS, THIS_TIME_NEXT_5_YEARS } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { OutputData } from '@editorjs/editorjs';
	import dayjs from 'dayjs';
	import { omit } from 'es-toolkit';
	import { onMount } from 'svelte';
	import z, { any, array, object, string } from 'zod';

	type Props = {
		name: string;
		disabled?: boolean;
		/** id of product type */
		productType: string;
		description: OutputData;
		attributes: AttributeValueInput[];
	};

	type CustomAttributeInput = AttributeValueInput & {
		required: boolean;
		inputType?: AttributeInputTypeEnum | null;
	};

	let {
		name = $bindable(),
		disabled,
		productType = $bindable(),
		description = $bindable(),
		attributes = $bindable(),
	}: Props = $props();

	const productTypeQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
		query: PRODUCT_TYPE_QUERY,
		requestPolicy: 'cache-and-network',
		variables: {
			id: productType,
		},
		pause: !productType,
	});

	/** keeps track of which attribute fields are focused and blured */
	let attributeFieldsBlurs = $state<boolean[]>([]);
	let innerAttributes = $state<CustomAttributeInput[]>([]);

	/** asynchronously calculate attribute errors */
	let attributeErrors = $derived.by<(string | undefined)[]>(() => {
		const result = new Array(innerAttributes.length).fill(undefined);

		for (let idx = 0; idx < innerAttributes.length; idx++) {
			const attr = innerAttributes[idx];

			if (!attr['required' as keyof AttributeValueInput]) continue;

			if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Dropdown &&
				(!attr.dropdown || !Object.keys(attr.dropdown).length)
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Boolean &&
				typeof attr.boolean !== 'boolean'
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Date &&
				!attr.date
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Numeric &&
				!attr.numeric
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.DateTime &&
				!attr.dateTime
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Reference &&
				(!attr.references || !attr.references.length)
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.RichText &&
				!attr.richText
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.PlainText &&
				!attr.plainText
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Swatch &&
				(!attr.swatch || !Object.keys(attr.swatch).length)
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.File &&
				!attr.file
			) {
				result[idx] = CommonState.FieldRequiredError;
			} else if (
				attr['inputType' as keyof AttributeValueInput] === AttributeInputTypeEnum.Multiselect &&
				(!attr.multiselect || !attr.multiselect.length)
			) {
				result[idx] = CommonState.FieldRequiredError;
			}
		}

		return result;
	});

	onMount(() => {
		const unsub = productTypeQuery.subscribe((result) => {
			if (result.data?.productType?.productAttributes?.length) {
				attributeFieldsBlurs = new Array(result.data.productType.productAttributes.length).fill(
					false,
				);

				innerAttributes = result.data.productType.productAttributes.map<CustomAttributeInput>(
					({ valueRequired, inputType, id }) => {
						const result: CustomAttributeInput = {
							required: valueRequired,
							inputType,
							id,
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
					},
				);
			}
		});

		return unsub;
	});

	const checkAttributeValidity = (
		idx: number,
		validCheck: (attr: CustomAttributeInput) => boolean,
	) => {
		if (attributeFieldsBlurs[idx]) {
			attributeErrors[idx] = validCheck(innerAttributes[idx])
				? undefined
				: CommonState.FieldRequiredError;
		}
	};

	const GeneralSchema = object({
		name: string().nonempty(CommonState.FieldRequiredError),
		productType: string().nonempty(CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).nonempty(CommonState.FieldRequiredError),
		}),
		// attributes: array(any()).nonempty(CommonState.FieldRequiredError),
	});

	type GeneralProps = z.infer<typeof GeneralSchema>;

	let generalErrors = $state<Partial<Record<keyof GeneralProps, string[]>>>({});

	const validate = () => {
		const result = GeneralSchema.safeParse({
			name,
			productType,
			description,
		});

		generalErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	$effect(() => {
		if (productType) {
			productTypeQuery.reexecute({
				variables: {
					id: productType,
				},
			});
		}
	});

	$effect(() => {
		if (!attributeErrors.some(Boolean)) {
			attributes = innerAttributes.map<AttributeValueInput>((attr) =>
				omit(attr, ['inputType', 'required']),
			);
		}
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General information</SectionHeader>
	<Input
		placeholder={$tranFunc('placeholders.enterPrdName')}
		bind:value={name}
		onblur={validate}
		inputDebounceOption={{ onInput: validate }}
		variant={generalErrors.name?.length ? 'error' : undefined}
		subText={generalErrors.name?.[0]}
		required
		label={$tranFunc('product.prdName')}
		{disabled}
	/>
	<GraphqlPaginableSelect
		query={PRODUCT_TYPES_QUERY}
		variables={{
			first: 20,
			filter: {
				search: '',
			},
		} as QueryProductTypesArgs}
		resultKey="productTypes"
		optionValueKey="id"
		optionLabelKey="name"
		label={$tranFunc('product.prdType')}
		required
		bind:value={productType}
		variant={generalErrors.productType?.length ? 'error' : 'info'}
		subText={generalErrors.productType?.[0]}
		onblur={validate}
		onchange={validate}
		{disabled}
	/>

	{#if productType}
		<div>
			{#if $productTypeQuery.fetching}
				<TableSkeleton numOfRows={2} numColumns={2} />
			{:else if $productTypeQuery.error}
				<Alert variant="error" size="sm" bordered>
					{$productTypeQuery.error.message}
				</Alert>
			{:else if $productTypeQuery.data?.productType?.productAttributes}
				<Label required requiredAtPos="end" label="Attributes" />
				<div class="grid grid-cols-2 gap-2 rounded-lg p-3 border border-gray-200">
					{#each $productTypeQuery.data?.productType?.productAttributes as node, idx (idx)}
						<div>
							{#if node.inputType === AttributeInputTypeEnum.Dropdown && node.choices}
								{@const options = node.choices.edges.map<SelectOption>(
									({ node: { id, name } }) => ({
										value: id,
										label: name || id,
									}),
								)}
								<Select
									{options}
									label={node.name || '-'}
									{disabled}
									required={node.valueRequired}
									onchange={(opt) => {
										innerAttributes = innerAttributes.map((attr, i) => {
											if (i !== idx) return attr;

											return {
												...attr,
												dropdown: opt ? { id: (opt as SelectOption).value as string } : undefined,
											};
										});
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Boolean}
								<Checkbox
									{disabled}
									label={node.name || '-'}
									required={node.valueRequired}
									onchange={(evt) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, boolean: evt.currentTarget.checked } : attr,
										);
									}}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Date}
								<EaseDatePicker
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(value) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, date: dayjs(value.date).format('YYYY-MM-DD') } : attr,
										);
									}}
									timeConfig={false}
									allowSelectMonthYears={{
										showMonths: true,
										showYears: {
											min: THIS_TIME_LAST_5_YEARS.year(),
											max: THIS_TIME_NEXT_5_YEARS.year(),
										},
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.File}
								<Input
									type="file"
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(evt) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, file: evt.currentTarget.files?.[0].name } : attr,
										);
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Numeric}
								<Input
									placeholder={$tranFunc('placeholders.valuePlaceholder')}
									type="number"
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(evt) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, numeric: evt.currentTarget.value } : attr,
										);
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.DateTime}
								<EaseDatePicker
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(value) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, dateTime: value.date } : attr,
										);
									}}
									autoApply={false}
									allowSelectMonthYears={{
										showMonths: true,
										showYears: {
											min: THIS_TIME_LAST_5_YEARS.year(),
											max: THIS_TIME_NEXT_5_YEARS.year(),
										},
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Reference}
								<div>ref</div>
							{:else if node.inputType === AttributeInputTypeEnum.RichText}
								<div>
									<EditorJSComponent
										placeholder={$tranFunc('placeholders.valuePlaceholder')}
										label={node.name || '-'}
										onchange={(data) => {
											innerAttributes = innerAttributes.map((attr, i) =>
												i === idx ? { ...attr, richText: JSON.stringify(data) } : attr,
											);
										}}
										{disabled}
										required={node.valueRequired}
										variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
										subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
									/>
								</div>
							{:else if node.inputType === AttributeInputTypeEnum.PlainText}
								<Input
									type="text"
									onchange={(evt) => {
										innerAttributes = innerAttributes.map((attr, i) =>
											i === idx ? { ...attr, plainText: evt.currentTarget.value } : attr,
										);
									}}
									label={node.name || '-'}
									required={node.valueRequired}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									{disabled}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Multiselect && node.choices}
								{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
									value: id,
									label: name || id,
								})) as SelectOption[]}
								<Select
									{options}
									multiple
									required={node.valueRequired}
									label={node.name || '-'}
									{disabled}
									onchange={(values) => {
										innerAttributes = innerAttributes.map((attr, i) => {
											if (i !== idx || !Array.isArray(values)) return attr;
											return {
												...attr,
												multiselect: values.map((vl) => ({
													value: `${vl.value}`,
												})),
											};
										});
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && attributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? attributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Swatch}
								<Label required={node.valueRequired} requiredAtPos="end" label={node.name || '-'} />
								<div class="flex items-center gap-2 flex-wrap flex-row">
									{#each node.choices?.edges || [] as edge, sid (sid)}
										<div class="tooltip tooltip-top" data-tip={edge.node.name}>
											<div
												class="w-9 h-9 rounded flex items-center justify-center"
												style="background-color: {edge.node.value}"
											>
												<input
													type="radio"
													{disabled}
													class="radio radio-xs"
													value={edge.node.value}
													checked={edge.node.value === innerAttributes[idx]?.swatch?.value}
													onchange={(evt) => {
														innerAttributes = innerAttributes.map((attr, i) => {
															if (i !== idx) return attr;

															return {
																...attr,
																swatch: {
																	value: evt.currentTarget.value,
																},
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
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<EditorJSComponent
		header={{ placeholder: 'Heading 2', levels: [2, 3, 4], defaultLevel: 2 }}
		simpleImage
		list={{
			defaultStyle: 'unordered',
			maxLevel: 3,
			inlineToolbar: true,
		}}
		embed={{
			services: {
				youtube: true,
			},
		}}
		quote={{ inlineToolbar: true }}
		onchange={validate}
		placeholder={$tranFunc('placeholders.valuePlaceholder')}
		bind:value={description}
		variant={generalErrors.description?.length ? 'error' : 'info'}
		subText={generalErrors.description?.[0]}
		required
		label="Product description"
	/>
</div>
