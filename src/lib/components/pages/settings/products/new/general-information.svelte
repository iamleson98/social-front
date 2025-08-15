<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { type QueryProductTypesArgs } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import z, { object, string } from 'zod';

	type Props = {
		name: string;
		disabled?: boolean;
		productType: string;
	};

	let { name = $bindable(), disabled, productType = $bindable() }: Props = $props();

	const GeneralSchema = object({
		name: string().nonempty(CommonState.FieldRequiredError),
		productType: string().nonempty(CommonState.FieldRequiredError),
	});

	type GeneralProps = z.infer<typeof GeneralSchema>;

	let generalErrors = $state<Partial<Record<keyof GeneralProps, string[]>>>({});

	const validate = () => {};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General information</SectionHeader>
	<Input
		placeholder={$tranFunc('placeholders.enterPrdName')}
		size="md"
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
		{disabled}
	/>

	{#if productType}
		<div>
			<!-- <Label required requiredAtPos="end" label={$tranFunc('product.tabAttributes')} /> -->

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
											label: name || id,
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
														dropdown: opt
															? { id: (opt as SelectOption).value as string }
															: undefined,
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
													i === idx ? { ...attr, boolean: evt.currentTarget.checked } : attr,
												);
											}}
										/>
									{:else if node.inputType === AttributeInputTypeEnum.Date}
										<EaseDatePicker
											size="sm"
											disabled={loading}
											onchange={(value) => {
												innerAttributes = innerAttributes.map((attr, i) =>
													i === idx
														? { ...attr, date: Dayjs(value.date).format('YYYY-MM-DD') }
														: attr,
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
													i === idx ? { ...attr, file: evt.currentTarget.files?.[0].name } : attr,
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
													i === idx ? { ...attr, numeric: evt.currentTarget.value } : attr,
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
													i === idx ? { ...attr, dateTime: value.date } : attr,
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
														i === idx ? { ...attr, richText: JSON.stringify(data) } : attr,
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
													i === idx ? { ...attr, plainText: evt.currentTarget.value } : attr,
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
											label: name || id,
										})) as SelectOption[]}
										<Select
											{options}
											size="sm"
											multiple
											disabled={loading}
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
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
