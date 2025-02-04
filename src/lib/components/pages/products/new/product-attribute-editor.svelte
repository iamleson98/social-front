<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import { MultiSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { AttributeInputTypeEnum, type AttributeValueInput, type Query } from '$lib/gql/graphql';
	import {
		PRODUCT_ATTRIBUTES_QUERY,
		type CustomAttributesQueryArgs
	} from '$lib/stores/api/admin/attribute';
	import { operationStore } from '$lib/stores/api/operation';
	import { defaultChannel } from '$lib/utils/consts';
	import { slide } from 'svelte/transition';
	import { tranFunc } from '$i18n';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { onMount } from 'svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { RequiredAt } from '$lib/components/ui';
	import ErrorMsg from './error-msg.svelte';

	type CustomAttributeInput = AttributeValueInput & {
		required: boolean;
		inputType?: AttributeInputTypeEnum | null;
	};

	type Props = {
		categoryID?: string | null;
		attributes: AttributeValueInput[];
		ok: boolean;
	};

	const MAX_FETCHING_BATCH = 50;
	let { categoryID, attributes = $bindable([]), ok = $bindable() }: Props = $props();

	let prevCategoryID = $state(categoryID);
	let blurTriggers = $state<boolean[]>([]);

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

	const attributeQueryStore = operationStore<Pick<Query, 'attributes'>, CustomAttributesQueryArgs>({
		kind: 'query',
		query: PRODUCT_ATTRIBUTES_QUERY,
		context: {
			requestPolicy: 'network-only'
		},
		variables: {
			first: MAX_FETCHING_BATCH,
			choiceFirst: MAX_FETCHING_BATCH,
			channel: defaultChannel.slug,
			where: {
				inCategory: categoryID
			}
		},
		pause: !categoryID
	});

	onMount(() => {
		const unsub = attributeQueryStore.subscribe((result) => {
			if (result.data?.attributes?.edges.length) {
				blurTriggers = new Array(result.data.attributes.edges.length).fill(false);
				attributes = result.data.attributes.edges.map<CustomAttributeInput>(({ node }) => {
					const result: CustomAttributeInput = {
						required: node.valueRequired,
						inputType: node.inputType
					};

					if (node.inputType === AttributeInputTypeEnum.Dropdown) {
						result.dropdown = {};
					} else if (node.inputType === AttributeInputTypeEnum.Multiselect) {
						result.multiselect = [];
					} else if (node.inputType === AttributeInputTypeEnum.Swatch) {
						result.swatch = {};
					} else if (node.inputType === AttributeInputTypeEnum.Reference) {
						result.references = [];
					}
					return result;
				});
			}
		});

		return unsub;
	});

	// listener when category id changes
	$effect(() => {
		if (categoryID && categoryID !== prevCategoryID) {
			prevCategoryID = categoryID; // reassign prev state
			attributeQueryStore.reexecute({
				variables: {
					...$attributeQueryStore.operation.variables,
					where: {
						inCategory: categoryID
					}
				}
			});
		}
	});
</script>

<div class="hidden!"></div>

{#if categoryID}
	<div class="mb-3">
		<RequiredAt class="text-sm" label={$tranFunc('product.tabAttributes')} required />

		<div class="bg-gray-50 rounded-lg border border-gray-200 p-3" transition:slide>
			{#if $attributeQueryStore.fetching}
				<div class="flex items-center flex-wrap">
					{#each [null, null] as _}
						<div class="w-1/2">
							<SkeletonContainer class="w-full">
								<Skeleton class="w-3/4 h-2" />
							</SkeletonContainer>
						</div>
					{/each}
				</div>
			{:else if $attributeQueryStore.error}
				<Alert variant="error" size="sm" bordered>
					{$attributeQueryStore.error.message}
				</Alert>
			{:else if !$attributeQueryStore.data?.attributes?.edges.length}
				<Alert variant="info" size="sm" bordered>{$tranFunc('product.noAttributes')}</Alert>
			{:else if $attributeQueryStore.data?.attributes?.edges}
				<div class="flex items-start flex-wrap">
					{#each $attributeQueryStore.data?.attributes?.edges as { node }, idx (idx)}
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
											attributes = attributes.map((attr, i) =>
												i === idx
													? {
															...attr,
															dropdown: opt ? { id: `${opt.value}`, value: opt.label } : {}
														}
													: attr
											);
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
												i === idx ? { ...attr, boolean: evt.currentTarget.checked } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Date}
									<EaseDatePicker
										size="sm"
										onchange={(value) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { ...attr, date: value.date } : attr
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
												i === idx ? { ...attr, file: evt.currentTarget.files?.[0].name } : attr
											);
										}}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Numeric}
									<Input
										placeholder={$tranFunc('product.valuePlaceholder')}
										size="sm"
										type="number"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
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
										onchange={(value) => {
											attributes = attributes.map((attr, i) =>
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
									<div>richText</div>
								{:else if node.inputType === AttributeInputTypeEnum.PlainText}
									<Input
										size="sm"
										type="text"
										onchange={(evt) => {
											attributes = attributes.map((attr, i) =>
												i === idx ? { ...attr, plainText: evt.currentTarget.value } : attr
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
									<div>swatch</div>
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
