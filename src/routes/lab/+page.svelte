<script lang="ts">
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { type QueryProductsArgs } from '$lib/gql/graphql';

	const options: SelectOption[] = [
		{
			label: 'one',
			value: 'one',
		},
		{
			label: 'two',
			value: 'two',
		},
	];
</script>

<Select multiple {options} onNotFoundQuerySelected={console.log} />

<GraphqlPaginableSelect
	query={PRODUCT_LIST_QUERY}
	variables={{ first: 15, filter: { search: '' } } as QueryProductsArgs}
	variableSearchQueryPath={'filter.search'}
	optionValueKey="id"
	optionLabelKey="name"
	resultKey="products"
	multiple
/>
