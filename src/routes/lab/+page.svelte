<script lang="ts">
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { Input } from '$lib/components/ui/Input';
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

<Select multiple {options} onNotFoundQuerySelected={console.log} onblur={console.log} />

<!-- <Input onblur={console.log} /> -->
