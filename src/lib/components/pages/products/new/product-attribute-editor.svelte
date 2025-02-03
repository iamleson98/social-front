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

	type Props = {
		categoryID?: string | null;
		attributes: AttributeValueInput[];
	};

	const MAX_FETCHING_BATCH = 50;
	let { categoryID, attributes = $bindable([]) }: Props = $props();

	let prevCategoryID = $state(categoryID);

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
				attributes = result.data.attributes.edges.map<AttributeValueInput>(({ node }) => {
					switch (node.inputType) {
						case AttributeInputTypeEnum.Dropdown:
							return {
								dropdown: {}
							};
						case AttributeInputTypeEnum.Multiselect:
							return {
								multiselect: []
							};
						case AttributeInputTypeEnum.Swatch:
							return {
								swatch: {}
							};
						case AttributeInputTypeEnum.Reference:
							return {
								references: []
							};

						default:
							return {};
					}
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
				<Alert variant="error" size="md" bordered>
					{$attributeQueryStore.error.message}
				</Alert>
			{:else if !$attributeQueryStore.data?.attributes?.edges.length}
				<Alert variant="info" size="sm" bordered>{$tranFunc('product.noAttributes')}</Alert>
			{:else if $attributeQueryStore.data?.attributes?.edges}
				<div class="flex items-center flex-wrap">
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
										onchange={(opt) =>
											(attributes[idx].dropdown = { id: `${opt.value}`, value: opt.label })}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Boolean}
									<Checkbox size="sm" bind:checked={attributes[idx].boolean} />
								{:else if node.inputType === AttributeInputTypeEnum.Date}
									<EaseDatePicker
										size="sm"
										onchange={(value) => (attributes[idx].date = value.date)}
										timeConfig={false}
										allowSelectMonthYears={{ showMonths: true, showYears: { min: 2020 } }}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.File}
									<input type="file" class="file-input file-input-md" />
								{:else if node.inputType === AttributeInputTypeEnum.Numeric}
									<Input
										placeholder={$tranFunc('product.valuePlaceholder')}
										size="sm"
										type="number"
										bind:value={attributes[idx].numeric}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.DateTime}
									<EaseDatePicker
										size="sm"
										onchange={(value) => (attributes[idx].dateTime = value.date)}
										autoApply={false}
										allowSelectMonthYears={{ showMonths: true, showYears: { min: 2020 } }}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.Reference}
									<div>ref</div>
								{:else if node.inputType === AttributeInputTypeEnum.RichText}
									<div>richText</div>
								{:else if node.inputType === AttributeInputTypeEnum.PlainText}
									<Input size="sm" type="text" bind:value={attributes[idx].plainText} />
								{:else if node.inputType === AttributeInputTypeEnum.Multiselect && node.choices}
									{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
										value: id,
										label: name || id
									})) as SelectOption[]}
									<MultiSelect {options} size="sm" value={[]} />
								{:else if node.inputType === AttributeInputTypeEnum.Swatch}
									<div>swatch</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
