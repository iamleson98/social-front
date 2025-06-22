<script lang="ts">
	import { ORDER_FULFILL_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		Mutation,
		MutationOrderFulfillArgs,
		Order,
		OrderFulfillInput,
		OrderFulfillLineInput,
		OrderFulfillStockInput,
		OrderLine,
		Query,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';

	type Props = {
		orderLines: OrderLine[];
		open: boolean;
		order: Order;
		onFulfillSuccess: () => void;
	};

	let { orderLines, open = $bindable(), order, onFulfillSuccess }: Props = $props();

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
			title: 'Quantity',
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
		kind: 'query',
		query: SHOP_QUERY,
	});

	let orderFulfillInput = $state<OrderFulfillInput>({
		lines: orderLines.map<OrderFulfillLineInput>((item) => {
			let stocks: Partial<OrderFulfillStockInput>[] = [];

			if (!item.variant?.preorder) {
				const highestAllocationWarehouse = item.allocations?.reduce(
					(acc, cur) => (!acc || acc.quantity < cur.quantity ? cur : acc),
					null as any,
				);

				stocks = [
					{
						quantity: item.quantityToFulfill,
						warehouse: highestAllocationWarehouse?.warehouse?.id,
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
	let areWarehouseSet = $derived(
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

		return !overFulfill && isAtleastOneFulfilled && areWarehouseSet;
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

		if (checkIfGraphqlResultHasError(result, 'orderFulfill', 'Successfully fulfilled order lines'))
			return;

		open = false;
		onFulfillSuccess();
	};
</script>

{#snippet image({ item }: { item: OrderLine })}
	<Thumbnail src={item.thumbnail?.url} alt={item.thumbnail?.alt || item.productName} size="sm" />
{/snippet}

{#snippet name({ item }: { item: OrderLine })}
	<span>{item.productName}</span>
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
		{@const selectOptions =
			item.variant?.stocks?.map<SelectOption>((item) => ({
				label: item.warehouse.name,
				value: item.warehouse.id,
			})) || []}
		{@const defaultWarehouseID = orderFulfillInput.lines[idx].stocks[0]?.warehouse}
		<Select
			options={selectOptions}
			placeholder="Choose warehouse"
			size="sm"
			value={defaultWarehouseID}
			onchange={(opt) => handleWarehouseChange(idx, (opt as SelectOption)?.value as string)}
			disabled={loading}
		/>
	{/if}
{/snippet}

{#snippet quantity({ item, idx }: { item: OrderLine; idx: number })}
	<div class="flex items-center gap-1">
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
	</div>
{/snippet}

<Modal
	{open}
	size="lg"
	onClose={() => (open = false)}
	onCancel={() => (open = false)}
	closeOnOutsideClick
	closeOnEscape
	header="Items ready to ship"
	hideFooter
>
	<Table columns={TABLE_COLUMNS} items={orderLines} />

	<div class="flex items-center gap-2 justify-end">
		<Button size="sm" disabled={!shouldEnableSaveBtn || loading} onclick={handleFulfill} {loading}>
			Save
		</Button>
		<Button size="sm" variant="light" onclick={() => (open = false)} color="red" disabled={loading}>
			Cancel
		</Button>
	</div>
</Modal>
