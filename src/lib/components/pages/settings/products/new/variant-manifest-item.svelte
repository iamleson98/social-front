<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_VALUES_QUERY } from '$lib/api/admin/attribute';
	import { Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { type GraphqlPaginationArgs } from '$lib/components/ui/Table';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { type Query } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import type { VariantManifest } from './utils';

	type Props = {
		index: number;
		attributeOptions: SelectOption[];
		disabled?: boolean;
		manifest: VariantManifest;
		performFetchAttributeValues: boolean;
		onAttributeValuesChange: (index: number, opts?: SelectOption | SelectOption[]) => void;
		onSelectAddNewAttributeValue: (index: number, value: string) => void;
		onDeleteVariant: (index: number) => void;
		onAttributeChange?: (opt?: SelectOption | SelectOption[]) => void;
	};

	let {
		index,
		attributeOptions,
		disabled,
		manifest = $bindable(),
		performFetchAttributeValues = $bindable(),
		onAttributeValuesChange,
		onSelectAddNewAttributeValue,
		onDeleteVariant,
		onAttributeChange,
	}: Props = $props();
</script>

<div class={SitenameCommonClassName}>
	<Select
		placeholder="Select an attribute"
		label="Variant #{index + 1}"
		options={attributeOptions}
		bind:value={manifest.attribute.id}
		{disabled}
		onchange={onAttributeChange}
	/>

	{#if manifest.attribute.id}
		{#key manifest.attribute.id}
			<GraphqlPaginableSelect
				{disabled}
				query={ATTRIBUTE_VALUES_QUERY}
				variables={{
					id: manifest.attribute.id,
					first: 15,
					filter: { search: '' },
				} as GraphqlPaginationArgs}
				label="Attribute values"
				resultKey={'attribute.choices' as keyof Query}
				variableSearchQueryPath="filter.search"
				optionValueKey="id"
				optionLabelKey="name"
				multiple
				value={manifest.values.map((item) => item.value)}
				onchange={(opt) => onAttributeValuesChange(index, opt)}
				size="sm"
				bind:performDataFetching={performFetchAttributeValues}
				onNotFoundQuerySelected={(newValue) =>
					newValue && onSelectAddNewAttributeValue(index, newValue)}
			/>
		{/key}
	{/if}

	<Button
		endIcon={Trash}
		size="sm"
		{disabled}
		fullWidth
		variant="light"
		color="red"
		onclick={() => onDeleteVariant(index)}
	>
		{$tranFunc('product.delVariant')}
	</Button>
</div>
