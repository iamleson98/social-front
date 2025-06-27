<script lang="ts">
	import { VOUCHER_CODE_LIST_QUERY } from '$lib/api/admin/discount';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		Table,
		TableSkeleton,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { type Query, type VoucherCode } from '$lib/gql/graphql';
	import { v4 as uuid } from 'uuid';

	type Props = {
		voucherId: string;
	};

	type AddVoucherCodeProps = Omit<VoucherCode, 'id' | 'createdAt'>;

	let { voucherId }: Props = $props();

	const TABLE_COLUMNS: TableColumnProps<AddVoucherCodeProps>[] = [
		{
			title: 'Code',
			child: code,
		},
		{
			title: 'Usage',
			child: usage,
		},
		{
			title: 'Status',
			child: status,
		},
	];

	let openAddCodeModal = $state(false);
	let forceReExecuteGraphqlQuery = $state(true);
	let addCodeType = $state<'manual' | 'auto'>('manual');
	let addVoucherCodes = $state.raw<AddVoucherCodeProps[]>([]);

	let manualVoucherCode = $state('');

	let maxAutoCodes = $state(1);
	let autoCodePrefix = $state('');

	const handleAddVoucherCodes = () => {
		debugger;
		if (addCodeType === 'manual') {
			if (!manualVoucherCode.trim()) return;

			addVoucherCodes = addVoucherCodes.concat({
				code: manualVoucherCode,
				used: '-' as any,
				isActive: false,
			});
			openAddCodeModal = false;
			manualVoucherCode = '';
			return;
		}

		if (!autoCodePrefix.trim()) return;
		if (maxAutoCodes < 1 || maxAutoCodes > 50) return;

		autoCodePrefix = autoCodePrefix.trim();
		const newCodes = new Array(maxAutoCodes).fill(null).map<AddVoucherCodeProps>(() => ({
			code: [autoCodePrefix, uuid()].join('-'),
			used: '-' as any,
			isActive: false,
		}));
		addVoucherCodes = addVoucherCodes.concat(newCodes);
		openAddCodeModal = false;
		maxAutoCodes = 1;
		autoCodePrefix = '';
	};
</script>

{#snippet code({ item }: { item: AddVoucherCodeProps })}
	<Badge variant="light" color="blue" text={item.code || '-'} />
{/snippet}

{#snippet usage({ item }: { item: AddVoucherCodeProps })}
	<span>{item.used}</span>
{/snippet}

{#snippet status({ item }: { item: AddVoucherCodeProps })}
	<Badge
		variant="light"
		color={item.isActive ? 'green' : 'red'}
		text={item.isActive ? 'Active' : 'Inactive'}
	/>
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>
		<div>Voucher codes</div>
		<Button size="xs" variant="outline" endIcon={Plus} onclick={() => (openAddCodeModal = true)}>
			Add voucher codes
		</Button>
	</SectionHeader>

	{#if addVoucherCodes.length}
		<div class="rounded-lg p-3 border border-gray-200 bg-white">
			<Table columns={TABLE_COLUMNS} items={addVoucherCodes} />
		</div>
	{/if}

	<GraphqlPaginableTable
		query={VOUCHER_CODE_LIST_QUERY}
		resultKey={'voucher.codes' as keyof Query}
		variables={{
			id: voucherId,
			first: 10,
		}}
		bind:forceReExecuteGraphqlQuery
		columns={TABLE_COLUMNS}
	/>
</div>

<Modal
	open={openAddCodeModal}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAddCodeModal = false)}
	onCancel={() => (openAddCodeModal = false)}
	onOk={handleAddVoucherCodes}
	size="sm"
	header="Add voucher codes"
>
	<div class="grid grid-cols-2 mb-3">
		{#each ['manual', 'auto'] as type, idx (idx)}
			<RadioButton size="sm" label={type} bind:group={addCodeType} value={type} />
		{/each}
	</div>

	<div class="space-y-2">
		{#if addCodeType === 'manual'}
			<Input
				label="Voucher code"
				placeholder="Voucher code"
				required
				bind:value={manualVoucherCode}
			/>
		{:else}
			<Input
				label="Number of codes"
				placeholder="Number of codes"
				max={50}
				min={0}
				required
				type="number"
				bind:value={maxAutoCodes}
			/>

			<Input label="Prefix" placeholder="Code prefix" bind:value={autoCodePrefix} />
		{/if}
	</div>
</Modal>
