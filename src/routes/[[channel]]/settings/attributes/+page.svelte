<script lang="ts">
	import { PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import Filter from '$lib/components/pages/settings/attributes/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Attribute, AttributeSortField, type QueryAttributesArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';

	let variables = $state<QueryAttributesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});

	let forceReExecuteGraphqlQuery = $state(true);

	const AttributeColumns: TableColumnProps<Attribute, AttributeSortField>[] = [
		{
			title: 'Name',
			child: name,
			key: AttributeSortField.Name,
		},
		{
			title: 'Visible in store front',
			child: visible,
			key: AttributeSortField.VisibleInStorefront,
		},
		{
			title: 'Filterable in store front',
			child: filterable,
			key: AttributeSortField.FilterableInStorefront,
		},
		{
			title: 'Input type',
			child: isInputType,
		},
	];
</script>

{#snippet name({ item }: { item: Attribute })}
	<a href={AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet isInputType({ item }: { item: Attribute })}
	<span>{item.inputType?.toLowerCase().replace('_', ' ') ?? '-'}</span>
{/snippet}

{#snippet visible({ item }: { item: Attribute })}
	<Badge
		text={item.visibleInStorefront ? 'yes' : 'no'}
		color={item.visibleInStorefront ? 'green' : 'red'}
	/>
{/snippet}

{#snippet filterable({ item }: { item: Attribute })}
	<Badge
		text={item.filterableInStorefront ? 'yes' : 'no'}
		color={item.filterableInStorefront ? 'green' : 'red'}
	/>
{/snippet}

<Filter bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={PRODUCT_ATTRIBUTES_QUERY}
	resultKey="attributes"
	bind:variables
	bind:forceReExecuteGraphqlQuery
	columns={AttributeColumns}
/>
