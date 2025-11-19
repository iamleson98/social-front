<script lang="ts" module>
	import { writable, get as getStore } from 'svelte/store';

	const store = writable<Record<string, boolean>>({});

	/**
	 * When define new variants, please make sure there is no duplication within this enum.
	 */
	export enum TableNameKeys {
		VoucherProductCatalogTable = 'voucher_product_catalog',
		VoucherCategoryCatalogTable = 'voucher_category_catalog',
		VoucherCollectionCatalogTable = 'voucher_collection_catalog',
		VoucherVariantCatalogTable = 'voucher_variant_catalog',

		NewVoucherCategoryTableName = 'new_voucher_category_table_name',
		NewVoucherCollectionTableName = 'new_voucher_collection_table_name',
		NewVoucherProductTableName = 'new_voucher_product_table_name',
		NewVoucherVariantTableName = 'new_voucher_variant_table_name',

		CollectionListTable = 'collections_list',
		ProductListTable = 'products_list',
		CategoryListTable = 'categories_list',
		VariantListTable = 'variants_list',

		CategorySubCategories = 'category_subCategories',
		CategoryProducts = 'category_products',

		VoucherCodesTable = 'voucher_codes_list',

		AttributeValuesTable = 'attribute_values',

		WarehouseShippingZonesTable = 'warehouse_shipping_zones',

		CollectionProductAssignTable = 'collection_product_assign',

		CollectionProductListTable = 'collection_product_list',

		UserGistcardsTable = 'user_giftcards',
		CustomerOrdersTable = 'customer_orders',
		VariantForOrderLinesTable = 'variants_for_order_lines',
		VariantForOrderTable = 'variants_for_order',
		PermissionGroupStaffTable = 'permission_group_staffs',
		ProductAttributesTable = 'product_attributes',
		ProductTypesAttributesTable = 'product_types_attributes',

		AttributesTable = 'attributes_table',
		BlogsTable = 'blogs_table',
		DraftOrdersTable = 'draft_orders_table',

		GiftcardsTable = 'giftcards_tables',

		MyGiftcardsTable = 'my_giftcards_table',
		MyOrdersTable = 'my_orders',

		PermissionGroupsTable = 'permission_groups_table',

		ProductTypesTable = 'product_types',
		PromotionsTable = 'promotions_table',

		ShippingZonesTable = 'shipping_zones_table',
		ShopOrdersTable = 'shop_orders',

		StaffTable = 'staff_table',
		CustomerTable = 'customer_table',

		VoucherTable = 'vouchers',

		WarehousesTable = 'warehouses',
	}

	if (Object.values(TableNameKeys).length !== new Set(Object.values(TableNameKeys)).size)
		throw new Error('Duplicate key name found in TableNameKeys');

	const registerKey = (name: TableNameKeys, runNow: boolean = false) => {
		if (getStore(store)[name] != undefined) return;
		// throw new Error(`Key name already existed: ${name}. Please specify a unique name`);

		store.update((state) => ({ ...state, [name]: runNow }));
	};

	const unregisterKey = (name: TableNameKeys) => {
		store.set(omit(getStore(store), [name]));
	};

	const toggleFetchDataByKeyName = (keyName: TableNameKeys, enable: boolean) => {
		store.update((state) => ({ ...state, [keyName]: enable }));
	};

	/**
	 * A method to re-fetch the table data.
	 * @param keyName The name of the table instance.
	 *
	 * Example:
	 * if you component use <GraphqlPaginableTable tableName="products" />
	 * then you should call reFetchTableData('products')
	 */
	export const reFetchTableData = (keyName: TableNameKeys) => {
		toggleFetchDataByKeyName(keyName, true);
	};
</script>

<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { type PageInfo, type Query } from '$lib/gql/graphql';
	import TableSkeleton from './table-skeleton.svelte';
	import Table from './table.svelte';
	import type {
		CountableConnection,
		GraphqlPaginationArgs,
		RowOptions,
		SortState,
		TableProps,
	} from './types';
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import { omit } from 'es-toolkit';
	import { get } from 'es-toolkit/compat';
	import { onMount, tick } from 'svelte';

	type Props = {
		query: TypedDocumentNode<any, AnyVariables & GraphqlPaginationArgs>;
		variables: AnyVariables & GraphqlPaginationArgs;
		/** default to 'network-only' */
		requestPolicy?: RequestPolicy;
		/** for example the products query support pagination, then you must pass 'products' as resultKey */
		resultKey: keyof Query;
		/**
		 * In some listing pages, url search params must be parsed before signalling the data fetching.
		 * But in some places, the table data does not depends on those url params, and data fetching need to be done immediately, right after the component in mounted.
		 * So instead of having to explicitly call to `reFetchTableData`, you can pass in this prop as `true`.
		 *
		 * @default false
		 */
		autoFetchDataOnMount?: boolean;
		/**
		 * tell the component how to reposition the items within the array list.
		 *
		 * if `swap-position`, then the 2 items at drag and drop position will be swapped.
		 *
		 * If `move-position`, then the drag item will move to the drop index
		 */
		dragEffectType?: 'swap-position' | 'move-position';
		/**
		 * A callback function that will be called when the drag and drop action is completed.
		 * NOTE: If some of your columns contains interactive elements, like checkbox, input, link, textarea, select,
		 * Then you must add the attribute `data-interactive` to it
		 */
		onDragEnd?: (dragIndex: number, dragItem: T, dropIndex: number, dropItem: T) => void;
		/**
		 * if true, then the query will be re-executed when variable changes. Default to `false`
		 */
		autoRefetchOnPaginationParamsChange?: boolean;
		/**
		 * a unique name for the table instance. This is used to identify the table instance when re-fetching data.
		 * Please note that the name must be unique within the application.
		 */
		tableName: TableNameKeys;
	} & Omit<
		TableProps<T, K>,
		| 'items'
		| 'pagination'
		| 'onNextPagelick'
		| 'onPreviousPagelick'
		| 'onChangeRowsPerPage'
		| 'onSortChange'
		| 'rowsPerPage'
		| 'onDragEnd'
	>;

	let {
		query,
		variables = $bindable({
			first: 10,
		}),
		requestPolicy = 'cache-and-network',
		resultKey,
		columns,
		onDragEnd,
		dragEffectType,
		disabled,
		class: className,
		autoRefetchOnPaginationParamsChange = false,
		tableName,
		autoFetchDataOnMount = false,
	}: Props = $props();

	if ((dragEffectType && !onDragEnd) || (!dragEffectType && onDragEnd))
		throw new Error('dragEffectType and onDragEnd must be provided together');

	const queryOperationStore = operationStore<
		Pick<Query, typeof resultKey>,
		AnyVariables & GraphqlPaginationArgs
	>({
		query,
		variables,
		requestPolicy,
		pause: true, // to prevent unnecessary network call, this operation will be paused by default
	});

	let sortState = $derived(
		variables.sortBy?.field ? { [variables.sortBy.field]: variables.sortBy.direction } : {},
	);
	let items = $state.raw<T[]>([]);
	let pagination = $state.raw<PageInfo>();

	onMount(() => {
		registerKey(tableName, autoFetchDataOnMount);

		const unsub = queryOperationStore.subscribe((result) => {
			if (result.data) {
				const connection: CountableConnection<T> = get(result.data, resultKey);
				if (!connection) throw new Error(`invalid result key: ${resultKey}`);

				items = connection.edges.map((edge) => edge.node) || [];
				pagination = connection.pageInfo;
			}
		});

		return () => {
			unsub();
			unregisterKey(tableName);
		};
	});

	$effect(() => {
		if ($store[tableName]) {
			queryOperationStore.reexecute({ variables });

			tick().then(() => {
				toggleFetchDataByKeyName(tableName, false);
			});
		}
	});

	const handleNextPageClick = (after: string) => {
		variables = {
			...variables,
			after,
			before: null,
			first: variables.first || variables.last,
			last: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handlePreviousPagelick = (before: string) => {
		variables = {
			...variables,
			before,
			after: null,
			last: variables.last || variables.first,
			first: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handleRowsPerPageChange = (num: RowOptions) => {
		variables = {
			...variables,
			first: num,
			last: null,
			before: null,
			after: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handleSortChange = (sort: SortState<K>) => {
		const keys = Object.keys(sort);
		if (!keys.length) return;

		const key = keys[0];
		const direction = sort[key as K];
		if (direction === 'NEUTRAL') return;

		variables = {
			...variables,
			first: variables.first || variables.last || 10,
			last: null,
			before: null,
			after: null,
			sortBy: {
				field: key,
				direction,
			},
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const innerHandleDragEnd = (dragIdx: number, dropIdx: number) => {
		if (dragIdx === dropIdx || !onDragEnd) return;

		const dragItem = items[dragIdx];
		const dropItem = items[dropIdx];
		const newItems = [...items];

		if (Math.abs(dragIdx - dropIdx) === 1 || dragEffectType === 'swap-position') {
			newItems[dragIdx] = newItems[dropIdx];
			newItems[dropIdx] = dragItem;
		} else if (dragEffectType === 'move-position') {
			const [dragItem] = newItems.splice(dragIdx, 1);
			newItems.splice(dropIdx, 0, dragItem);
		}

		items = newItems;
		onDragEnd(dragIdx, dragItem, dropIdx, dropItem);
	};
</script>

{#if $queryOperationStore.fetching}
	<TableSkeleton numColumns={columns.length} />
{:else if $queryOperationStore.error}
	<Alert variant="error" size="sm" bordered>
		{$queryOperationStore.error.message}
	</Alert>
{:else if $queryOperationStore.data}
	<Table
		{items}
		{columns}
		graphqlPagination={pagination}
		onNextPagelick={handleNextPageClick}
		onPreviousPagelick={handlePreviousPagelick}
		onChangeRowsPerPage={handleRowsPerPageChange}
		onSortChange={handleSortChange}
		rowsPerPage={(variables.first || variables.last) as RowOptions}
		defaultSortState={sortState as SortState<K>}
		class={className}
		disabled={$queryOperationStore.fetching || disabled}
		onDragEnd={onDragEnd ? innerHandleDragEnd : undefined}
	/>
{/if}
