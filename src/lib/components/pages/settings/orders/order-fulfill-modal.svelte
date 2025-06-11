<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type {
		OrderFulfillInput,
		OrderFulfillLineInput,
		OrderFulfillStockInput,
		OrderLine,
	} from '$lib/gql/graphql';

	type Props = {
		orderLines: OrderLine[];
		open: boolean;
		onClose: () => void;
	};

	let { orderLines, open, onClose }: Props = $props();

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
</script>

{#snippet image({ item }: { item: OrderLine })}
	<div class="avatar">
		<div class="w-9 rounded-lg border border-gray-200">
			<img src={item.thumbnail?.url} alt={item.thumbnail?.alt} />
		</div>
	</div>
{/snippet}

{#snippet name({ item }: { item: OrderLine })}
	<span>{item.productName}</span>
{/snippet}

{#snippet sku({ item }: { item: OrderLine })}
	<span>{item.productSku}</span>
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
			inputDebounceOption={{
				onInput: (evt) => handleQuantityChange(idx, evt),
			}}
		/>
		<div class="">
			/{item.quantity}
		</div>
	</div>
{/snippet}

<Modal
	{open}
	size="lg"
	{onClose}
	onCancel={onClose}
	closeOnOutsideClick
	closeOnEscape
	header="Items ready to ship"
>
	<div>
		<Table columns={TABLE_COLUMNS} items={orderLines} />
	</div>
</Modal>
