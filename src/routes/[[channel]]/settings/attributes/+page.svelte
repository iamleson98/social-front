<script lang="ts">
	import { tranFunc } from '$i18n';
	import { ATTRIBUTE_DELETE_MUTATION, PRODUCT_ATTRIBUTES_QUERY } from '$lib/api/admin/attribute';
	import { operationStore } from '$lib/api/operation';
	import { Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/attributes/filter.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
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
	import { toast } from 'svelte-sonner';

	let variables = $state<QueryAttributesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const AttributeColumns: TableColumnProps<Attribute, AttributeSortField>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: name,
			key: AttributeSortField.Name,
		},
		{
			title: $tranFunc('attributes.visibleInStore'),
			child: visible,
			key: AttributeSortField.VisibleInStorefront,
		},
		{
			title: $tranFunc('attributes.filterableInAdmin'),
			child: filterable,
			key: AttributeSortField.FilterableInDashboard,
		},
		{
			title: $tranFunc('attributes.inputType'),
			child: isInputType,
		},
		{
			title: $tranFunc('common.action'),
			child: action,
		},
	]);

	const AttributeDeleteStore = operationStore<
		Pick<Mutation, 'attributeDelete'>,
		MutationAttributeDeleteArgs
	>({
		query: ATTRIBUTE_DELETE_MUTATION,
		variables: {
			id: undefined,
		},
		pause: true,
		onResult: (result) => {
			if (checkIfGraphqlResultHasError(result, 'attributeDelete')) return;
			toast.success($tranFunc('common.delSuccess'));
			tableRef?.triggerFetchData();
		},
	});

	const handleDeleteAttribute = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: () => {
				AttributeDeleteStore.reexecute({
					variables: {
						id,
					},
				});
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
		disabled={$AttributeDeleteStore.fetching}
	/>
{/snippet}

{#snippet isInputType({ item }: { item: Attribute })}
	<span>{item.inputType?.toLowerCase().replace('_', ' ') ?? '-'}</span>
{/snippet}

{#snippet visible({ item }: { item: Attribute })}
	<Badge
		text={item.visibleInStorefront ? $tranFunc('common.yes') : $tranFunc('common.no')}
		color={item.visibleInStorefront ? 'green' : 'red'}
	/>
{/snippet}

{#snippet filterable({ item }: { item: Attribute })}
	<Badge
		text={item.filterableInDashboard ? $tranFunc('common.yes') : $tranFunc('common.no')}
		color={item.filterableInDashboard ? 'green' : 'red'}
	/>
{/snippet}

<div class="mb-2">
	<Filter bind:variables {tableRef} />
</div>

<GraphqlPaginableTable
	query={PRODUCT_ATTRIBUTES_QUERY}
	resultKey="attributes"
	bind:variables
	disabled={$AttributeDeleteStore.fetching}
	columns={AttributeColumns}
	bind:this={tableRef}
/>
