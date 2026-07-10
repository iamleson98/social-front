<script lang="ts">
	import { T } from '$i18n';
	import { PRODUCT_TYPE_QUERY, PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input, Label } from '$lib/components/ui/Input';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type AttributeValueInput,
		type Query,
		type QueryProductTypeArgs,
		type QueryProductTypesArgs,
		type SelectedAttribute,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import {
		BASIC_DATE_FORMAT,
		THIS_TIME_LAST_5_YEARS,
		THIS_TIME_NEXT_5_YEARS,
	} from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import type { OutputData } from '@editorjs/editorjs';
	import dayjs from 'dayjs';
	import { omit, pick } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { any, array, object, string } from 'zod';

	type Props = {
		name: string;
		disabled?: boolean;
		/** id of product type */
		productType: string;
		description: OutputData;
		attributes: AttributeValueInput[];
		/** must provide in edit page */
		existingAttributes?: SelectedAttribute[];
		formOk?: boolean;
		isCreatePage?: boolean;
		/** bindable, to help parant component to decide whether to show dimension metadata section */
		productTypeRequiresShipping: boolean;
	};

	type CustomAttributeInput = AttributeValueInput & {
		valueRequired: boolean;
		inputType?: AttributeInputTypeEnum | null;
	};

	let {
		name = $bindable(),
		disabled,
		productType = $bindable(),
		description = $bindable(),
		existingAttributes,
		attributes = $bindable(),
		formOk = $bindable(true),
		isCreatePage = !existingAttributes?.length,
		productTypeRequiresShipping = $bindable(),
	}: Props = $props();

	const ProductTypeQuery = operationStore<Pick<Query, 'productType'>, QueryProductTypeArgs>({
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
	const AttributeErrors = $derived.by<(string | undefined)[]>(() => {
		const result = new Array(innerAttributes.length).fill(undefined);

		for (let idx = 0; idx < innerAttributes.length; idx++) {
			const attr = innerAttributes[idx];

			if (!attr.valueRequired) continue;

			if (
				attr.inputType === AttributeInputTypeEnum.Dropdown &&
				(!attr.dropdown || !Object.keys(attr.dropdown).length)
			) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (
				attr.inputType === AttributeInputTypeEnum.Boolean &&
				typeof attr.boolean !== 'boolean'
			) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.Date && !attr.date) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.Numeric && !attr.numeric) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.DateTime && !attr.dateTime) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (
				attr.inputType === AttributeInputTypeEnum.Reference &&
				(!attr.references || !attr.references.length)
			) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.RichText && !attr.richText) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.PlainText && !attr.plainText) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (
				attr.inputType === AttributeInputTypeEnum.Swatch &&
				(!attr.swatch || !Object.keys(attr.swatch).length)
			) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (attr.inputType === AttributeInputTypeEnum.File && !attr.file) {
				result[idx] = $CommonState.FieldRequiredError;
			} else if (
				attr.inputType === AttributeInputTypeEnum.Multiselect &&
				(!attr.multiselect || !attr.multiselect.length)
			) {
				result[idx] = $CommonState.FieldRequiredError;
			}
		}

		return result;
	});

	onMount(() =>
		ProductTypeQuery.subscribe((result) => {
			if (result.data?.productType?.productAttributes?.length) {
				attributeFieldsBlurs = new Array(result.data.productType.productAttributes.length).fill(
					false,
				);

				innerAttributes = result.data.productType.productAttributes.map<CustomAttributeInput>(
					(props) => {
						const result: CustomAttributeInput = pick(props, ['id', 'inputType', 'valueRequired']);

						let existingAttribute: SelectedAttribute | undefined = undefined;
						// if it is edit page, and product already has attributes assigned.
						// we must populate those existing attributes to innerAttributes state.
						if (!isCreatePage && existingAttributes?.length) {
							existingAttribute = existingAttributes.find(
								(attr) => attr.attribute.id === props.id && attr.values.length,
							);
						}

						if (props.inputType === AttributeInputTypeEnum.Dropdown) {
							result.dropdown = existingAttribute
								? pick(existingAttribute.values[0], ['id', 'value'])
								: {};
						} else if (props.inputType === AttributeInputTypeEnum.Multiselect) {
							result.multiselect = existingAttribute?.values?.map(({ id }) => ({ id })) || [];
						} else if (props.inputType === AttributeInputTypeEnum.Swatch) {
							result.swatch = existingAttribute
								? pick(existingAttribute?.values[0], ['value', 'id'])
								: {};
						} else if (props.inputType === AttributeInputTypeEnum.Reference) {
							result.references = existingAttribute?.values.map(({ id }) => id) || [];
						} else if (props.inputType === AttributeInputTypeEnum.Date) {
							result.date = existingAttribute?.values?.[0]?.date;
						} else if (props.inputType === AttributeInputTypeEnum.DateTime) {
							result.dateTime = existingAttribute?.values?.[0]?.dateTime;
						} else if (props.inputType === AttributeInputTypeEnum.Boolean) {
							result.boolean = existingAttribute?.values?.[0]?.boolean;
						} else if (props.inputType === AttributeInputTypeEnum.Numeric) {
							result.numeric = existingAttribute?.values?.[0]?.value;
						} else if (props.inputType === AttributeInputTypeEnum.RichText) {
							result.richText = existingAttribute?.values?.[0]?.richText;
						} else if (props.inputType === AttributeInputTypeEnum.File) {
							result.file = existingAttribute?.values?.[0].file?.url;
						} else if (props.inputType === AttributeInputTypeEnum.SingleReference) {
							result.reference = existingAttribute?.values?.[0].reference;
						}

						return result;
					},
				);

				productTypeRequiresShipping = result.data.productType?.isShippingRequired;
			}
		}),
	);

	const GeneralSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		productType: string().nonempty($CommonState.FieldRequiredError),
		description: object({
			blocks: array(any()).nonempty($CommonState.FieldRequiredError),
		}),
	});

	const SchemaHandler = createSchemaHandler(
		GeneralSchema,
		() => ({
			name,
			productType,
			description,
		}),
		(ok) => (formOk = ok && !AttributeErrors.some(Boolean)),
	);

	$effect(() => {
		if (productType) {
			ProductTypeQuery.reexecute({
				variables: {
					id: productType,
				},
			});
		}
	});

	$effect(() => {
		// Always sync attributes to parent so the latest values are available on save.
		// Validation errors are displayed independently via AttributeErrors.
		attributes = innerAttributes.map<AttributeValueInput>((attr) =>
			omit(attr, ['inputType', 'valueRequired']),
		);
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('common.generalInfo')}</SectionHeader>
	<Input
		bind:value={name}
		onblur={SchemaHandler.validate}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
		required
		label={$T('product.prdName')}
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
		disabled={disabled || !isCreatePage}
		resultKey="productTypes"
		optionValueKey="id"
		optionLabelKey="name"
		label={$T('product.prdType')}
		required
		bind:value={productType}
		variant={$SchemaHandler.productType?.length ? 'error' : 'info'}
		subText={$SchemaHandler.productType?.[0]}
		onblur={SchemaHandler.validate}
		onchange={SchemaHandler.validate}
	/>

	{#if productType}
		<div>
			{#if $ProductTypeQuery.fetching}
				<TableSkeleton numOfRows={2} numColumns={2} />
			{:else if $ProductTypeQuery.error}
				<Alert variant="error" size="sm" bordered>
					{$ProductTypeQuery.error.message}
				</Alert>
			{:else if $ProductTypeQuery.data?.productType?.productAttributes}
				<Label required requiredAtPos="end" label="Attributes" />
				<div class="grid grid-cols-2 gap-2 rounded-lg p-3 border border-gray-200">
					{#each $ProductTypeQuery.data?.productType?.productAttributes as node, idx (idx)}
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
									value={innerAttributes[idx]?.dropdown?.id!}
									onchange={(opt) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											dropdown: opt ? { id: (opt as SelectOption).value as string } : undefined,
										};
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Boolean}
								<Checkbox
									{disabled}
									label={node.name || '-'}
									required={node.valueRequired}
									value={innerAttributes[idx]?.boolean}
									onchange={(evt) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											boolean: evt.currentTarget.checked,
										};
									}}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Date}
								<EaseDatePicker
									{disabled}
									required={node.valueRequired}
									value={{ date: innerAttributes[idx]?.date }}
									label={node.name || '-'}
									onchange={(value) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											date: dayjs(value.date).format(BASIC_DATE_FORMAT),
										};
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
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.File}
								<Input
									type="file"
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(evt) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											file: evt.currentTarget.files?.[0].name,
										};
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Numeric}
								<Input
									placeholder={$T('placeholders.valuePlaceholder')}
									type="number"
									{disabled}
									value={innerAttributes[idx].numeric
										? Number(innerAttributes[idx].numeric)
										: undefined}
									required={node.valueRequired}
									label={node.name || '-'}
									onchange={(evt) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											numeric: evt.currentTarget.value,
										};
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.DateTime}
								<EaseDatePicker
									{disabled}
									required={node.valueRequired}
									label={node.name || '-'}
									value={{ date: innerAttributes[idx]?.dateTime }}
									onchange={(value) => {
										innerAttributes[idx] = {
											...innerAttributes[idx],
											dateTime: value.date,
										};
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
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Reference}
								<Input
									type="text"
									label={node.name || '-'}
									value={innerAttributes[idx]?.reference}
									inputDebounceOption={{
										onInput: (evt) =>
											(innerAttributes[idx] = {
												...innerAttributes[idx],
												reference: (evt.currentTarget as HTMLInputElement).value,
											}),
									}}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.RichText}
								<div>
									<EditorJSComponent
										placeholder={$T('placeholders.valuePlaceholder')}
										label={node.name || '-'}
										onchange={(data) => {
											innerAttributes[idx] = {
												...innerAttributes[idx],
												richText: JSON.stringify(data),
											};
										}}
										value={innerAttributes[idx]?.richText}
										{disabled}
										required={node.valueRequired}
										variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
										subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
									/>
								</div>
							{:else if node.inputType === AttributeInputTypeEnum.PlainText}
								<Input
									type="text"
									inputDebounceOption={{
										onInput: (evt) =>
											(innerAttributes[idx] = {
												...innerAttributes[idx],
												plainText: (evt.currentTarget as HTMLInputElement).value,
											}),
									}}
									value={innerAttributes[idx]?.plainText}
									label={node.name || '-'}
									required={node.valueRequired}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									{disabled}
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
								/>
							{:else if node.inputType === AttributeInputTypeEnum.Multiselect && node.choices}
								{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
									value: id,
									label: name || id,
								})) as SelectOption[]}
								<Select
									{options}
									multiple
									value={innerAttributes[idx].multiselect?.map((item) => item.id!)}
									required={node.valueRequired}
									label={node.name || '-'}
									{disabled}
									onchange={(values) => {
										if (Array.isArray(values))
											innerAttributes[idx] = {
												...innerAttributes[idx],
												multiselect: values.map((vl) => ({
													value: `${vl}`,
												})),
											};
									}}
									onblur={() => (attributeFieldsBlurs[idx] = true)}
									variant={attributeFieldsBlurs[idx] && AttributeErrors[idx] ? 'error' : 'info'}
									subText={attributeFieldsBlurs[idx] ? AttributeErrors[idx] : undefined}
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
															innerAttributes[idx] = {
																...innerAttributes[idx],
																swatch: {
																	id: edge.node.id,
																	value: evt.currentTarget.value,
																},
															};
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
		onchange={SchemaHandler.validate}
		placeholder={$T('placeholders.valuePlaceholder')}
		bind:value={description}
		variant={$SchemaHandler.description?.length ? 'error' : 'info'}
		subText={$SchemaHandler.description?.[0]}
		required
		label={$T('product.prdDescription')}
	/>
</div>
