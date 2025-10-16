<script lang="ts">
	import { ORDER_FULFILL_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Sticky } from '$lib/components/ui/Popover';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type {
		Allocation,
		Mutation,
		MutationOrderFulfillArgs,
		Order,
		OrderFulfillInput,
		OrderFulfillLineInput,
		OrderFulfillStockInput,
		OrderLine,
		Query,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import {
		checkIfGraphqlResultHasError,
		stringSlicer,
	} from '$lib/utils/utils';

	type Props = {
		open: boolean;
		order: Order;
		onFulfillSuccess: () => void;
	};

	let { open = $bindable(), order, onFulfillSuccess }: Props = $props();

	const TABLE_COLUMNS: TableColumnProps<OrderLine, any>[] = [
		{
			title: 'Image',
			child: image,
		},
		{
			title: 'Name',
			child: name,
		},
		{
			title: 'SKU',
			child: sku,
		},
		{
			title: 'Quantity to fulfill',
			child: quantity,
		},
		{
			title: 'Stock',
			child: stock,
		},
		{
			title: 'Warehouse',
			child: warehouse,
		},
	];

	let loading = $state(false);

	const shopQuery = operationStore<Pick<Query, 'shop'>>({
		query: SHOP_QUERY,
	});
	const UnfulfilledOrderLines = order.lines.filter((item) => item.quantityToFulfill > 0);
	let activeWarehousesForCurrentOrderLine = $state<SelectOption[]>([]);
	let activeTargetForWarehouseSelect = $state<HTMLInputElement>();
	let defaultWarehouseIdForSelect = $state<string>();

	let orderFulfillInput = $state<OrderFulfillInput>({
		lines: UnfulfilledOrderLines.map<OrderFulfillLineInput>((item) => {
			let stocks: OrderFulfillStockInput[] = [];

			if (!item.variant?.preorder) {
				const highestAllocationWarehouse = item.allocations?.reduce(
					(acc, cur) => (!acc || acc.quantity < cur.quantity ? cur : acc),
					null as unknown as Allocation,
				);

				stocks = [
					{
						quantity: item.quantityToFulfill,
						warehouse: highestAllocationWarehouse?.warehouse?.id as string,
					},
				];
			}

			return {
				orderLineId: item.id,
				stocks: stocks as OrderFulfillStockInput[],
			};
		}),
	});

	let notAllowedToFulfillUnpaid = $derived(
		$shopQuery.data?.shop.fulfillmentAutoApprove &&
			!$shopQuery.data.shop.fulfillmentAllowUnpaid &&
			!order.isPaid,
	);
	let areWarehousesSet = $derived(
		orderFulfillInput.lines
			.filter((item) => !!item.stocks)
			.every((item) => item.stocks.every((stock) => stock.warehouse)),
	);

	let shouldEnableSaveBtn = $derived.by(() => {
		if (loading || !order || $shopQuery.fetching) return false;
		if (notAllowedToFulfillUnpaid) return false;

		const isAtleastOneFulfilled = orderFulfillInput.lines.some(
			(item) => item?.stocks?.[0]?.quantity > 0,
		);
		const overFulfill = orderFulfillInput.lines
			.filter((item) => !!item.stocks)
			.some((item) => {
				const quantityFulfilled = item.stocks[0].quantity;
				const quantityToFulfill = order.lines.find(
					(line) => line.id === item.orderLineId,
				)?.quantityToFulfill;

				return typeof quantityToFulfill === 'number' && quantityFulfilled > quantityToFulfill;
			});

		return !overFulfill && isAtleastOneFulfilled && areWarehousesSet;
	});

	const handleWarehouseChange = (lineIndex: number, warehouseId?: string) => {
		if (orderFulfillInput.lines[lineIndex].stocks.length)
			orderFulfillInput.lines[lineIndex].stocks[0].warehouse = warehouseId as string;
	};

	const handleQuantityChange = (lineIndex: number, evt: Event) => {
		if (orderFulfillInput.lines[lineIndex].stocks.length)
			orderFulfillInput.lines[lineIndex].stocks[0].quantity = Math.floor(
				Number((evt.target as HTMLInputElement).value),
			);
	};

	const handleFulfill = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderFulfill'>,
			MutationOrderFulfillArgs
		>(ORDER_FULFILL_MUTATION, {
			order: order.id,
			input: orderFulfillInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'orderFulfill', $CommonState.EditSuccess)) return;

		open = false;
		onFulfillSuccess();
	};

	const handleFocusOpenWarehouseDropdown = (
		idx: number,
		target: HTMLInputElement,
		currentWarehouseId?: string,
	) => {
		defaultWarehouseIdForSelect = currentWarehouseId;
		activeTargetForWarehouseSelect = target;
		activeWarehousesForCurrentOrderLine =
			UnfulfilledOrderLines[idx].variant?.stocks?.map<SelectOption>((item) => ({
				label: item.warehouse.name,
				value: item.warehouse.id,
			})) || [];
	};
</script>

{#snippet image({ item }: { item: OrderLine })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.productName} size="sm" />
{/snippet}

{#snippet name({ item }: { item: OrderLine })}
	<span title={item.productName}>{stringSlicer(item.productName, 50)}</span>
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	<span>{item.productSku || '-'}</span>
{/snippet}

{#snippet stock({ item, idx }: { item: OrderLine; idx: number })}
	{@const defaultWarehouseID = orderFulfillInput.lines[idx].stocks[0]?.warehouse}
	{@const stockOfGivenWarehouse =
		defaultWarehouseID && item.variant
			? item.variant?.stocks?.find((stock) => stock.warehouse.id === defaultWarehouseID)
			: undefined}

	<span class="font-medium text-blue-600">
		{defaultWarehouseID
			? item.variant?.preorder || !item.variant
				? undefined
				: stockOfGivenWarehouse?.quantity
			: '-'}
	</span>
{/snippet}

{#snippet warehouse({ item, idx }: { item: OrderLine; idx: number })}
	{#if item.variant?.preorder}
		<span>-</span>
	{:else}
		{@const defaultWarehouseID = orderFulfillInput.lines[idx].stocks[0]?.warehouse}
		<Input
			placeholder="Choose warehouse"
			size="sm"
			readonly
			value={defaultWarehouseID}
			onfocus={(evt) =>
				handleFocusOpenWarehouseDropdown(idx, evt.target as HTMLInputElement, defaultWarehouseID)}
		/>
	{/if}
{/snippet}

{#snippet quantity({ item, idx }: { item: OrderLine; idx: number })}
	<Input
		placeholder="Set order line quantity"
		type="number"
		value={item.quantityToFulfill}
		min={0}
		max={item.quantityToFulfill}
		size="sm"
		disabled={loading}
		inputDebounceOption={{
			onInput: (evt) => handleQuantityChange(idx, evt),
		}}
	>
		{#snippet action()}
			<span>/ {item.quantity}</span>
		{/snippet}
	</Input>
{/snippet}

<Modal
	{open}
	size="xl"
	onClose={() => (open = false)}
	onCancel={() => (open = false)}
	closeOnOutsideClick
	closeOnEscape
	header="Fulfill order #{order.number}"
	okText="Save"
	onOk={handleFulfill}
	disableOkBtn={!shouldEnableSaveBtn || loading}
	disableElements={loading}
>
	<div class="space-y-3">
		<SectionHeader>Items ready to ship</SectionHeader>
		<Table columns={TABLE_COLUMNS} items={UnfulfilledOrderLines} />

		<SectionHeader>Shipment information</SectionHeader>
		<Input
			label="Tracking number"
			placeholder="Tracking number"
			subText="Optionally provide a tracking number for this fulfillment"
		/>
		<Checkbox label="Send fulfillment email to customer" />
	</div>

	<!-- 
	NOTE: We now have problem with dropdown/popover within table.
	Table is wrapped within a div that handles content overflow-x: scroll.
	This unexpectedly hide overflow y as well.
	So this method is workaround for that issue.

	Also, this sticky must be placed within this modal to avoid z-index issue. and not close the modal
-->
	<Sticky
		bind:target={activeTargetForWarehouseSelect}
		placement="bottom-start"
	>
		<Select
			options={activeWarehousesForCurrentOrderLine}
			placeholder="Choose warehouse"
			size="sm"
			value={defaultWarehouseIdForSelect}
			disabled={loading}
		/>
	</Sticky>
</Modal>
