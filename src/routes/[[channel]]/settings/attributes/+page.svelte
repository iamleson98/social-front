<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_DELETE_MUTATION, PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/attributes/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		type Attribute,
		AttributeSortField,
		type Mutation,
		type MutationAttributeDeleteArgs,
		type QueryAttributesArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let variables = $state<QueryAttributesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});

	let forceReExecuteGraphqlQuery = $state(true);
	let loading = $state(false);

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
		{
			title: 'Action',
			child: action,
		},
	];

	const handleDeleteAttribute = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'attributeDelete'>,
					MutationAttributeDeleteArgs
				>(ATTRIBUTE_DELETE_MUTATION, {
					id,
				});

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'attributeDelete', $tranFunc('common.delSuccess')))
					return;

				forceReExecuteGraphqlQuery = true;
			},
		});
	};
</script>

{#snippet name({ item }: { item: Attribute })}
	<a href={AppRoute.SETTINGS_CONFIGS_ATTRIBUTE_DETAILS(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet action({ item }: { item: Attribute })}
	<IconButton
		icon={Trash}
		size="xs"
		variant="light"
		color="red"
		onclick={() => handleDeleteAttribute(item.id)}
		disabled={loading}
	/>
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
	disabled={loading}
	bind:forceReExecuteGraphqlQuery
	columns={AttributeColumns}
/>
