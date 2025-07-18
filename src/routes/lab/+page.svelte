<script lang="ts">
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import FilterContainer from '$lib/components/common/filter-box/filter-container.svelte';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { type QueryProductsArgs } from '$lib/gql/graphql';

	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});

	const filters: FilterProps<any>[] = [
		{
			label: 'Products',
			key: 'products',
			operations: [
				{
					operator: 'eq',
					component: products,
				},
			],
		},
	];
</script>

{#snippet products({ initialValue, onValue }: FilterComponentType)}
	<GraphqlPaginableSelect
		multiple
		placeholder="products"
		query={PRODUCT_LIST_QUERY}
		value={initialValue}
		optionLabelKey="name"
		optionValueKey="id"
		variables={{ first: 20, filter: { search: '' } } as QueryProductsArgs}
		variableSearchQueryPath="filter.search"
		size="sm"
		resultKey="products"
	/>
{/snippet}

<button onclick={() => cleanup()}>clean</button>
<button onclick={() => (count += 1)}>add</button>

<FilterContainer filterOptions={filters} open filters={{}} />
