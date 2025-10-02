<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		ProductTypeConfigurable,
		ProductTypeEnum,
		type ProductTypeFilterInput,
		type QueryProductTypesArgs,
	} from '$lib/gql/graphql';

	type Props = {
		variables: QueryProductTypesArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<ProductTypeFilterInput> = $derived({
		configurable: {
			label: $tranFunc('prdType.hasVariantAttrs'),
			operations: {
				eq: CommonSnippets.yesNo,
			},
		},
		productType: {
			label: $tranFunc('prdType.type'),
			operations: {
				eq: productType,
			},
		},
	});

	const ProductTypeTypeOptions = [
		ProductTypeEnum.Digital,
		ProductTypeEnum.Shippable,
	].map<SelectOption>((item) => ({
		label: item.toLowerCase(),
		value: item,
	}));
</script>

{#snippet productType({ initialValue, onValue }: FilterComponentType)}
	<Select
		size="xs"
		options={ProductTypeTypeOptions}
		placeholder="type"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as SelectOption).value)}
	/>
{/snippet}

<FilterManager
	bind:variables
	bind:forceReExecuteGraphqlQuery
	filterOptions={FilterOptions}
	searchKey={'filter.search' as keyof QueryProductTypesArgs}
	variablePatchingCallbackAfterReload={(newVariables, params) => {
		const { productType, configurable, search } = params;

		if (!newVariables.filter) newVariables.filter = {};

		if (productType) newVariables.filter.productType = productType.value as ProductTypeEnum;
		if (configurable)
			newVariables.filter.configurable = configurable.value as ProductTypeConfigurable;
		if (search) newVariables.filter.search = search.value as string;

		return newVariables;
	}}
/>
