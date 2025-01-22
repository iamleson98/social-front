<script lang="ts">
	import { SkeletonContainer, Skeleton } from '$lib/components/ui/Skeleton';
	import { Alert } from '$lib/components/ui/Alert';
	import { MultiSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import {
		AttributeInputTypeEnum,
		type AttributeValueInput,
		type Query
	} from '$lib/gql/graphql';
	import {
		PRODUCT_ATTRIBUTES_QUERY,
		type CustomAttributesQueryArgs
	} from '$lib/stores/api/admin/attribute';
	import { operationStore } from '$lib/stores/api/operation';
	import { defaultChannel } from '$lib/utils/consts';
	import { slide } from 'svelte/transition';
	import { tClient } from '$i18n';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';

	type Props = {
		categoryID?: string | null;
		attributes: AttributeValueInput[];
	};

	let { categoryID, attributes = $bindable([]) }: Props = $props();

	let prevCategoryID = $state(categoryID);

	const MAX_FETCHING_BATCH = 50;

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

{#if categoryID}
	<div class="mb-3">
		<span class="text-sm">{tClient('product.tabAttributes')}</span>
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
				<Alert variant="info" size="sm" bordered>{tClient('product.noAttributes')}</Alert>
			{:else if $attributeQueryStore.data?.attributes?.edges}
				<div class="flex items-center flex-wrap">
					{#each $attributeQueryStore.data?.attributes?.edges as { node }, idx (idx)}
						<div class="w-1/2 tablet:w-full p-1 shrink flex items-center mb-2">
							<div class="w-1/4 text-xs">
								{#if node.valueRequired}
									<strong class="mr-1 text-red-500">*</strong>
								{/if}
								<span>{node.name}</span>
							</div>
							<div class="w-3/4">
								{#if node.inputType === AttributeInputTypeEnum.Dropdown && node.choices}
									{@const options = node.choices.edges.map(({ node: { id, name } }) => ({
										value: id,
										label: name || id
									})) as SelectOption[]}
									<Select {options} size="sm" />
								{:else if node.inputType === AttributeInputTypeEnum.Boolean}
									<Checkbox size="sm" bind:checked={attributes[idx].boolean} />
								{:else if node.inputType === AttributeInputTypeEnum.Date}
									<div class="dropdown w-full">
										<Button size="sm" variant="light" fullWidth color="gray">
											{tClient('helpText.selectDate')}
										</Button>
										<div class="menu dropdown-content dropdown-bottom dropdown-start">
											<calendar-date class="cally bg-base-100 border border-gray-200 rounded-box">
												<calendar-month></calendar-month>
											</calendar-date>
										</div>
									</div>
								{:else if node.inputType === AttributeInputTypeEnum.File}
									<div>file</div>
								{:else if node.inputType === AttributeInputTypeEnum.Numeric}
									<Input
										placeholder={tClient('product.valuePlaceholder')}
										size="sm"
										type="number"
										bind:value={attributes[idx].numeric}
									/>
								{:else if node.inputType === AttributeInputTypeEnum.DateTime}
									<div>datetime</div>
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
