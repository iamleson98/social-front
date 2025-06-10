<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { OrderLine } from '$lib/gql/graphql';

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

{#snippet stock({ item }: { item: OrderLine })}
	<!-- {item.allocations} -->
   <span></span>
{/snippet}

{#snippet warehouse({ item }: { item: OrderLine })}
	{@const selectOptions =
		item.variant?.stocks?.map<SelectOption>((item) => ({
			label: item.warehouse.name,
			value: item.warehouse.id,
		})) || []}
	{@const defaultWh = item.allocations?.length ? item.allocations[0].warehouse.id : undefined}
	<Select options={selectOptions} placeholder="Choose warehouse" size="sm" value={defaultWh} />
{/snippet}

{#snippet quantity({ item }: { item: OrderLine })}
	<Input
		placeholder="Set order line quantity"
		type="number"
		value={item.quantity}
		min={item.quantity}
		size="sm"
	/>
{/snippet}

<Modal
	{open}
	size="md"
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
