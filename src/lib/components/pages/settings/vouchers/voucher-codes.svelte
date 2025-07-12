<script lang="ts">
	import { tranFunc } from '$i18n';
	import { VOUCHER_CODE_LIST_QUERY } from '$lib/api/admin/discount';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Query, type VoucherCode } from '$lib/gql/graphql';
	import { v4 as uuid } from 'uuid';
	import { number, string } from 'zod';

	type Props = {
		/** if not provided, meaning it is create page */
		voucherId?: string;
		addVoucherCodeStrings: string[];
		disabled?: boolean;
	};

	type AddVoucherCodeProps = Omit<VoucherCode, 'id' | 'createdAt'>;

	let { voucherId, addVoucherCodeStrings = $bindable(), disabled }: Props = $props();

	const TABLE_COLUMNS: TableColumnProps<AddVoucherCodeProps>[] = $derived([
		{
			title: $tranFunc('common.index'),
			child: no,
		},
		{
			title: $tranFunc('common.code'),
			child: code,
		},
		{
			title: $tranFunc('common.usage'),
			child: usage,
		},
		{
			title: $tranFunc('settings.status'),
			child: status,
		},
	]);

	const TEMPO_CODE_ACTION_COLUMN: TableColumnProps<AddVoucherCodeProps> = {
		title: deleteAll,
		child: actions,
	};

	const MAX_AUTO_CODES = 50;

	const MAX_ITEMS_EXCEED = $tranFunc('error.itemsExceed', { max: MAX_AUTO_CODES });
	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const AutoGenerateCodesSchema = number()
		.nonnegative($tranFunc('error.negativeNumber'))
		.max(MAX_AUTO_CODES, MAX_ITEMS_EXCEED);

	const ManualCodeSchema = string().nonempty(FIELD_REQUIRED);

	let openAddCodeModal = $state(false);
	let forceReExecuteGraphqlQuery = $state(true);
	let addCodeType = $state<'manual' | 'auto'>('manual');
	let addVoucherCodes = $state.raw<AddVoucherCodeProps[]>([]);
	let numberOfAutoGenerateCodesError = $state<string>();
	let manualVoucherCodeError = $state<string>();
	let manualVoucherCode = $state('');
	let numberOfAutoGenerateCodes = $state(1);
	let autoCodePrefix = $state('');

	const validate = () => {
		if (addCodeType === 'auto') {
			const result = AutoGenerateCodesSchema.safeParse(numberOfAutoGenerateCodes);
			numberOfAutoGenerateCodesError = result.success ? undefined : result.error.errors[0].message;
			return;
		}

		const result = ManualCodeSchema.safeParse(manualVoucherCode);
		manualVoucherCodeError = result.success ? undefined : result.error.errors[0].message;
	};

	$effect(() => {
		addVoucherCodeStrings = addVoucherCodes.map((item) => item.code!);
	});

	const handleAddVoucherCodes = () => {
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

		autoCodePrefix = autoCodePrefix.trim();
		const newCodes = new Array(numberOfAutoGenerateCodes)
			.fill(null)
			.map<AddVoucherCodeProps>(() => ({
				code: [autoCodePrefix, uuid()].filter(Boolean).join('-'),
				used: '-' as any,
				isActive: false,
			}));
		addVoucherCodes = addVoucherCodes.concat(newCodes);
		openAddCodeModal = false;
		numberOfAutoGenerateCodes = 1;
		autoCodePrefix = '';
	};

	const removeCode = (code?: AddVoucherCodeProps) => {
		addVoucherCodes = !code ? [] : addVoucherCodes.filter((item) => item.code !== code.code);
	};
</script>

{#snippet no({ idx }: { idx: number })}
	# {idx + 1}
{/snippet}

{#snippet code({ item }: { item: AddVoucherCodeProps })}
	<Badge color="blue" text={item.code || '-'} />
{/snippet}

{#snippet usage({ item }: { item: AddVoucherCodeProps })}
	<span>{item.used}</span>
{/snippet}

{#snippet actions({ item }: { item: AddVoucherCodeProps })}
	<div class="text-center">
		<IconButton
			icon={Trash}
			size="xs"
			{disabled}
			color="red"
			variant="light"
			onclick={() => removeCode(item)}
		/>
	</div>
{/snippet}

{#snippet deleteAll()}
	<div class="text-center">
		<IconButton
			icon={Trash}
			{disabled}
			size="xs"
			color="red"
			variant="light"
			class="tooltip tooltip-top"
			data-tip={$tranFunc('common.delAll')}
			onclick={() => removeCode()}
		/>
	</div>
{/snippet}

{#snippet status({ item }: { item: AddVoucherCodeProps })}
	<Badge color={item.isActive ? 'green' : 'red'} text={item.isActive ? 'Active' : 'Inactive'} />
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
	<SectionHeader>
		<div>{$tranFunc('voucher.voucherCodes')}</div>
		<Button
			size="xs"
			variant="outline"
			color="gray"
			endIcon={Plus}
			{disabled}
			onclick={() => (openAddCodeModal = true)}
		>
			{$tranFunc('voucher.newCodes')}
		</Button>
	</SectionHeader>

	{#if addVoucherCodes.length}
		<div class="rounded-lg p-3 border border-gray-200 bg-white">
			<Table
				columns={TABLE_COLUMNS.concat(TEMPO_CODE_ACTION_COLUMN)}
				items={addVoucherCodes}
				{disabled}
			/>
		</div>
	{/if}

	{#if voucherId}
		<GraphqlPaginableTable
			query={VOUCHER_CODE_LIST_QUERY}
			resultKey={'voucher.codes' as keyof Query}
			{disabled}
			variables={{
				id: voucherId,
				first: 10,
			}}
			bind:forceReExecuteGraphqlQuery
			columns={TABLE_COLUMNS}
		/>
	{/if}
</div>

<Modal
	open={openAddCodeModal}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAddCodeModal = false)}
	onCancel={() => (openAddCodeModal = false)}
	onOk={handleAddVoucherCodes}
	size="sm"
	header={$tranFunc('voucher.newCodes')}
	disableElements={!!numberOfAutoGenerateCodesError || !!manualVoucherCodeError}
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
				variant={manualVoucherCodeError ? 'error' : 'info'}
				subText={manualVoucherCodeError}
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
			/>
		{:else}
			<Input
				label="Number of codes"
				placeholder="Number of codes"
				max={MAX_AUTO_CODES}
				min={1}
				required
				type="number"
				bind:value={numberOfAutoGenerateCodes}
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={numberOfAutoGenerateCodesError ? 'error' : 'info'}
				subText={numberOfAutoGenerateCodesError}
			/>

			<Input label="Prefix" placeholder="Code prefix" bind:value={autoCodePrefix} />
		{/if}
	</div>
</Modal>
