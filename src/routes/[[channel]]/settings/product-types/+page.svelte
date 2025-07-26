<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPE_DELETE_MUTATION, PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/product-type/filter.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		type Mutation,
		type MutationProductTypeDeleteArgs,
		type ProductType,
		ProductTypeSortField,
		type QueryProductTypesArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	let variables = $state<QueryProductTypesArgs>({
		first: 20,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(false);
	let loading = $state(false);

	const ProductTypesColumns: TableColumnProps<ProductType, ProductTypeSortField>[] = $derived([
		{
			title: $tranFunc('common.name'),
			child: name,
			key: ProductTypeSortField.Name,
		},
		{
			title: $tranFunc('prdType.requireShip'),
			child: shippable,
			key: ProductTypeSortField.ShippingRequired,
		},
		{
			title: $tranFunc('product.taxCls'),
			child: taxClass,
		},
		{
			title: $tranFunc('common.action'),
			child: deleteItem,
		},
	]);

	const handleClickDelItem = async (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel', { id }),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'productTypeDelete'>,
					MutationProductTypeDeleteArgs
				>(PRODUCT_TYPE_DELETE_MUTATION, {
					id,
				});

				loading = false;

				if (
					checkIfGraphqlResultHasError(result, 'productTypeDelete', $tranFunc('common.delSuccess'))
				)
					return;

				forceReExecuteGraphqlQuery = true;
			},
		});
	};
</script>

{#snippet name({ item }: { item: ProductType })}
	<a href={AppRoute.SETTINGS_PRODUCT_TYPE_EDIT(item.id)} class="link">
		{item.name}
	</a>
{/snippet}

{#snippet taxClass({ item }: { item: ProductType })}
	<span>{item.taxClass?.name || '-'}</span>
{/snippet}

{#snippet deleteItem({ item }: { item: ProductType })}
	<IconButton
		icon={Trash}
		size="xs"
		color="red"
		variant="light"
		onclick={() => handleClickDelItem(item.id)}
	/>
{/snippet}

{#snippet shippable({ item }: { item: ProductType })}
	<Badge
		color={item.isShippingRequired ? 'green' : 'red'}
		text={item.isShippingRequired ? $tranFunc('common.yes') : $tranFunc('common.no')}
	/>
{/snippet}

<Filter bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={PRODUCT_TYPES_QUERY}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	columns={ProductTypesColumns}
	resultKey="productTypes"
/>
