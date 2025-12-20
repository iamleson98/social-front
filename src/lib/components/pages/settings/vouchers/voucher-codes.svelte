<script lang="ts">
	import { T } from '$i18n';
	import { VOUCHER_CODE_LIST_QUERY } from '$lib/api/admin/discount';
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { Input, RadioButton } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Query, type VoucherCode } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { v4 as uuid } from 'uuid';
	import { flattenError, number, string } from 'zod';

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
			title: $T('common.index'),
			child: no,
		},
		{
			title: $T('common.code'),
			child: code,
		},
		{
			title: $T('voucher.usage'),
			child: usage,
		},
		{
			title: $T('settings.status'),
			child: status,
		},
	]);

	const TEMPO_CODE_ACTION_COLUMN: TableColumnProps<AddVoucherCodeProps> = {
		title: deleteAll,
		child: actions,
	};

	const MAX_AUTO_CODES = 50;

	const MAX_ITEMS_EXCEED = $T('error.itemsExceed', { max: MAX_AUTO_CODES });

	type CodeGenerationType = 'manual' | 'auto';

	const NEW_CODE_TYPES = $derived([
		{
			value: 'manual',
			label: $T('common.manual'),
		},
		{
			value: 'auto',
			label: $T('common.auto'),
		},
	]);

	const AutoGenerateCodesSchema = number()
		.nonnegative($CommonState.NonNegativeError)
		.max(MAX_AUTO_CODES, MAX_ITEMS_EXCEED);

	const ManualCodeSchema = string().nonempty($CommonState.FieldRequiredError);

	let openAddCodeModal = $state(false);
	let addCodeType = $state<CodeGenerationType>('manual');
	let addVoucherCodes = $state.raw<AddVoucherCodeProps[]>([]);
	let numberOfAutoGenerateCodesError = $state<string>();
	let manualVoucherCodeError = $state<string>();
	let manualVoucherCode = $state('');
	let numberOfAutoGenerateCodes = $state(1);
	let autoCodePrefix = $state('');

	const DisableAddCodeModelOkButton = $derived(
		addCodeType === 'auto' ? !!numberOfAutoGenerateCodesError : !!manualVoucherCodeError,
	);

	const validate = () => {
		if (addCodeType === 'auto') {
			const result = AutoGenerateCodesSchema.safeParse(numberOfAutoGenerateCodes);
			numberOfAutoGenerateCodesError = result.success
				? undefined
				: flattenError(result.error).formErrors?.[0];
		} else {
			const result = ManualCodeSchema.safeParse(manualVoucherCode);
			manualVoucherCodeError = result.success
				? undefined
				: flattenError(result.error).formErrors?.[0];
		}
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

<!-- bypass linting warning -->
{void addVoucherCodeStrings}

{#snippet no({ idx }: { idx: number })}
	<span># {idx + 1}</span>
{/snippet}

{#snippet code({ item }: { item: AddVoucherCodeProps })}
	<div class="flex items-center justify-between">
		<Badge rounded variant="light" text={item.code || '-'} />
		<CopyButton copyContent={item.code || '-'} size="xs" />
	</div>
{/snippet}

{#snippet usage({ item }: { item: AddVoucherCodeProps })}
	<div class="text-center">{item.used}</div>
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
			data-tip={$T('common.delAll')}
			onclick={() => removeCode()}
		/>
	</div>
{/snippet}

{#snippet status({ item }: { item: AddVoucherCodeProps })}
	<Badge
		color={item.isActive ? 'green' : 'red'}
		text={$T(item.isActive ? 'staff.active' : 'staff.inactive')}
		rounded
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('voucher.voucherCodes')}</div>
		<Button
			size="xs"
			variant="light"
			endIcon={Plus}
			{disabled}
			onclick={() => (openAddCodeModal = true)}
		>
			{$T('voucher.newCodes')}
		</Button>
	</SectionHeader>

	{#if addVoucherCodes.length}
		<Table
			columns={TABLE_COLUMNS.concat(TEMPO_CODE_ACTION_COLUMN)}
			items={addVoucherCodes}
			{disabled}
		/>
	{:else if !addVoucherCodes.length && !voucherId}
		<Alert variant="warning" size="sm">
			{$T('voucher.noCodesWarning')}
		</Alert>
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
			columns={TABLE_COLUMNS}
			autoRefetchOnPaginationParamsChange
			autoFetchDataOnMount
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
	header={$T('voucher.newCodes')}
	disableOkBtn={DisableAddCodeModelOkButton}
>
	<div class="grid grid-cols-2 mb-3">
		{#each NEW_CODE_TYPES as type, idx (idx)}
			<RadioButton size="sm" label={type.label} bind:group={addCodeType} value={type.value} />
		{/each}
	</div>

	<div class="space-y-2">
		{#if addCodeType === 'manual'}
			<Input
				label={$T('voucher.voucherCode')}
				placeholder={$T('voucher.voucherCode')}
				required
				bind:value={manualVoucherCode}
				variant={manualVoucherCodeError ? 'error' : 'info'}
				subText={manualVoucherCodeError}
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
			/>
		{:else}
			<Input
				label={$T('voucher.noOfCodes')}
				placeholder={$T('voucher.noOfCodes')}
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

			<Input
				label={$T('common.prefix')}
				placeholder={$T('common.prefix')}
				bind:value={autoCodePrefix}
			/>
		{/if}
	</div>
</Modal>
