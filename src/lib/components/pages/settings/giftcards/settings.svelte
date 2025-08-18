<script lang="ts">
	import {
		GIFTCARD_SETTINGS_QUERY,
		GIFTCARD_SETTINGS_UPDATE_MUTATION,
	} from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { SettingCog } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		GiftCardSettingsExpiryTypeEnum,
		TimePeriodTypeEnum,
		type GiftCardSettingsUpdateInput,
		type Mutation,
		type MutationGiftCardSettingsUpdateArgs,
		type Query,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const GiftcardSettingsQuery = operationStore<Pick<Query, 'giftCardSettings'>>({
		query: GIFTCARD_SETTINGS_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true, // only execute when user choose to open setting modal
	});

	let loading = $state(false);
	let openSettingModal = $state(false);
	let openBulkIssueModal = $state(false);
	let openExportCodesModal = $state(false);

	let settingInput = $state<GiftCardSettingsUpdateInput>({
		expiryType: GiftCardSettingsExpiryTypeEnum.ExpiryPeriod,
		expiryPeriod: {
			amount: 0,
			type: TimePeriodTypeEnum.Day,
		},
	});
	const ExpiryTypes = Object.values(GiftCardSettingsExpiryTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLocaleLowerCase().replace(/_/g, ' '),
	}));
	const ExpiryPeriodTypes = Object.values(TimePeriodTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase().replace(/_/g, ' '),
	}));

	onMount(() =>
		GiftcardSettingsQuery.subscribe((result) => {
			if (result.data?.giftCardSettings) {
				const { expiryType, expiryPeriod } = result.data.giftCardSettings;
				settingInput = {
					expiryType,
					expiryPeriod: {
						amount: expiryPeriod?.amount || 0,
						type: expiryPeriod?.type || TimePeriodTypeEnum.Day,
					},
				};
			}
		}),
	);

	$effect(() => {
		// if (settingInput.expiryType )
	});

	const handleClickOpenSetting = () => {
		openSettingModal = true;
		GiftcardSettingsQuery.reexecute({ variables: {} });
	};

	const SettingOptions: MenuItemProps[] = [
		{
			children: 'Settings',
			onclick: handleClickOpenSetting,
		},
		{
			children: 'Bulk issue',
			onclick: () => (openBulkIssueModal = true),
		},
		{
			children: 'Export card codes',
			onclick: () => (openExportCodesModal = true),
		},
	];

	const handleUpdateSettings = async () => {
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardSettingsUpdate'>,
			MutationGiftCardSettingsUpdateArgs
		>(GIFTCARD_SETTINGS_UPDATE_MUTATION, {
			input: settingInput,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardSettingsUpdate', CommonState.EditSuccess))
			return;

		openSettingModal = false;
	};

	const handleBulkIssue = async () => {
		openBulkIssueModal = false;
	};

	const handleExportCodes = async () => {
		openExportCodesModal = false;
	};
</script>

<DropDown placement="bottom-end" options={SettingOptions}>
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<IconButton
			icon={SettingCog}
			{onclick}
			size="sm"
			color="gray"
			aria-label="Settings"
			data-tip="Settings"
			class="tooltip tooltip-left"
			disabled={loading}
		/>
	{/snippet}
</DropDown>

<Modal
	open={openSettingModal}
	header="Giftcard settings"
	size="sm"
	onCancel={() => (openSettingModal = false)}
	onClose={() => (openSettingModal = false)}
	onOk={handleUpdateSettings}
	disableElements={loading}
>
	{#if $GiftcardSettingsQuery.fetching}
		<SelectSkeleton label />
	{:else if $GiftcardSettingsQuery.error}
		<Alert variant="error" size="sm">{$GiftcardSettingsQuery.error.message}</Alert>
	{:else if $GiftcardSettingsQuery.data?.giftCardSettings}
		<div class="space-y-2">
			<Select
				required
				disabled={loading}
				options={ExpiryTypes}
				label="Expiry type"
				bind:value={settingInput.expiryType!}
				placeholder="Select type"
			/>

			{#if settingInput.expiryType === GiftCardSettingsExpiryTypeEnum.ExpiryPeriod}
				<div class="grid grid-cols-2 gap-2">
					<Input
						type="number"
						disabled={loading}
						bind:value={settingInput.expiryPeriod!.amount}
						placeholder="Amount"
						label="Amount"
						required
					/>
					<Select
						disabled={loading}
						options={ExpiryPeriodTypes}
						label="Duration type"
						placeholder="Duration type"
						required
						bind:value={settingInput.expiryPeriod!.type}
					/>
				</div>
			{/if}
		</div>
	{/if}
</Modal>

<Modal
	open={openBulkIssueModal}
	header="Bulk issue"
	onCancel={() => (openBulkIssueModal = false)}
	onClose={() => (openBulkIssueModal = false)}
	onOk={handleBulkIssue}
	disableElements={loading}
>
	<div>Bulk issue</div>
</Modal>

<Modal
	open={openExportCodesModal}
	header="Export giftcard codes"
	size="sm"
	onCancel={() => (openExportCodesModal = false)}
	onClose={() => (openExportCodesModal = false)}
	onOk={handleExportCodes}
	disableElements={loading}
>
	<div>Bulk issue</div>
</Modal>
