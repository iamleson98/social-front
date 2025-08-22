<script lang="ts">
	import {
		GIFT_CARD_TAGS_QUERY,
		GIFTCARD_SETTINGS_QUERY,
		GIFTCARD_SETTINGS_UPDATE_MUTATION,
		GIFTCARD_TOTAL_COUNT_QUERY,
	} from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { SettingCog } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import { Checkbox, CheckboxSkeleton, Input, Label, RadioButton } from '$lib/components/ui/Input';
	import Radio from '$lib/components/ui/Input/radio.svelte';
	import { Modal } from '$lib/components/ui/Modal';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import {
		GraphqlPaginableSelect,
		Select,
		SelectSkeleton,
		type SelectOption,
	} from '$lib/components/ui/select';
	import {
		ExportScope,
		FileTypesEnum,
		GiftCardSettingsExpiryTypeEnum,
		TimePeriodTypeEnum,
		type ExportGiftCardsInput,
		type GiftCardSettingsUpdateInput,
		type Mutation,
		type MutationGiftCardSettingsUpdateArgs,
		type Query,
		type QueryGiftCardsArgs,
		type QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { difference } from 'es-toolkit';
	import { onMount } from 'svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';

	type Props = {
		addTags: string[];
		removeTags: string[];
		variables: QueryGiftCardsArgs;
		selectedIds: Record<string, boolean>;
	};

	let { addTags, removeTags, variables = $bindable(), selectedIds = $bindable() }: Props = $props();

	const GiftcardSettingsQuery = operationStore<Pick<Query, 'giftCardSettings'>>({
		query: GIFTCARD_SETTINGS_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true, // only execute when user choose to open setting modal
	});

	let loading = $state(false);
	let openSettingModal = $state(false);
	let openBulkIssueModal = $state(false);
	let openExportCodesModal = $state(false);
	let activeTags = $state<string[]>([]);
	let disabled = $state(false);
	let balanceAmount = $state(0);
	let balanceCurrency = $state('');
	let cardsIssued = $state('');
	let requiresActivation = $state(false);
	let setExpiryDate = $state(false);

	let exportMode: 'all' | 'selected' | 'current' = $state('all');

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
			onclick: () => {
				openExportCodesModal = true;
				GiftcardTotalCountQuery.reexecute({ variables: {} });
			},
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

	const handleTagsChange = () => {
		if (!activeTags.length) {
			addTags = [];
			removeTags = [];
			return;
		}

		addTags = difference(activeTags, removeTags);
		removeTags = difference(removeTags, activeTags);
		//validate();
	};

	const GiftcardTotalCountQuery = operationStore<Pick<Query, 'giftCards'>, QueryGiftCardsArgs>({
		query: GIFTCARD_TOTAL_COUNT_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	let exportConfig = $state<ExportGiftCardsInput>({
		fileType: FileTypesEnum.Xlsx,
		scope: ExportScope.All,
		filter: null,
	});

	$effect(() => {
		if (exportConfig.scope === ExportScope.All) {
			exportConfig.ids = null;
			exportConfig.filter = null;
		} else if (exportConfig.scope === ExportScope.Ids) {
			exportConfig.filter = null;
			exportConfig.ids = Object.keys(selectedIds);
		} else if (exportConfig.scope === ExportScope.Filter) {
			exportConfig.ids = null;
			exportConfig.filter = variables.filter;
		}
	});
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
	header="Bulk Issue Gift Cards"
	onCancel={() => (openBulkIssueModal = false)}
	onClose={() => (openBulkIssueModal = false)}
	onOk={handleBulkIssue}
	disableElements={loading}
>
	<div class="space-y-2">
		<Input
			size="sm"
			placeholder="Cards issued"
			label="Cards Issued"
			class="flex-1"
			bind:value={cardsIssued}
			disabled={loading || disabled}
			required
		/>
		<div class="flex items-start gap-2">
			<Input
				size="sm"
				type="number"
				min={1}
				placeholder="Set balance amount"
				label="Balance amount"
				class="flex-2/3"
				bind:value={balanceAmount}
				disabled={loading || disabled}
				required
			/>
			<ShopCurrenciesSelect
				label="Currency"
				class="flex-1"
				required
				size="sm"
				placeholder="Currency"
				bind:value={balanceCurrency}
				{disabled}
			/>
		</div>

		<GraphqlPaginableSelect
			query={GIFT_CARD_TAGS_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
			resultKey="giftCardTags"
			variableSearchQueryPath="filter.search"
			optionValueKey="name"
			optionLabelKey="name"
			size="sm"
			requestPolicy="cache-and-network"
			multiple
			label="Giftcard Tags"
			placeholder="Giftcard tags"
			bind:value={activeTags}
			onchange={handleTagsChange}
			{disabled}
		/>

		<Checkbox label="Set gift card expiry date" bind:checked={setExpiryDate} {disabled} />

		{#if setExpiryDate}
			<GiftcardExpirationForm disabled={loading} />
		{/if}

		<Checkbox label="Requires activation" bind:checked={requiresActivation} {disabled} />

		<Alert size="sm" variant="info">
			After creation Saleor will create a list of gift card codes that you will be able to download.
		</Alert>
	</div>
</Modal>

<Modal
	header="Export Giftcards"
	open={openExportCodesModal}
	size="sm"
	onCancel={() => (openExportCodesModal = false)}
	onClose={() => (openExportCodesModal = false)}
	closeOnEscape
	okText="Export"
	onOk={handleExportCodes}
	closeOnOutsideClick
	disableElements={loading}
>
	<div class="space-y-3">
		{#if $GiftcardTotalCountQuery.fetching}
			<div class="flex flex-col gap-1.5">
				<CheckboxSkeleton label />
				<CheckboxSkeleton label />
			</div>
		{:else if $GiftcardTotalCountQuery.error}
			<Alert size="sm" variant="error">{$GiftcardTotalCountQuery.error.message}</Alert>
		{:else if $GiftcardTotalCountQuery.data}
			<Label label="Export information for" />
			<div class="space-y-2">
				<RadioButton
					value={ExportScope.All}
					label={`All giftcards (${$GiftcardTotalCountQuery.data.giftCards?.totalCount})`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Ids}
					label={`Selected giftcards (${selectedIds ? Object.keys(selectedIds).length : 0})`}
					bind:group={exportConfig.scope}
					size="sm"
					disabled={selectedIds ? Object.keys(selectedIds).length === 0 : false}
				/>
				<RadioButton
					value={ExportScope.Filter}
					label={`Current search`}
					bind:group={exportConfig.scope}
					size="sm"
				/>
			</div>
		{/if}

		<Label label="Export as" />
		<div class="space-y-2">
			{#each Object.values(FileTypesEnum) as value, idx (idx)}
				<RadioButton
					size="sm"
					{value}
					label={value.toLowerCase()}
					bind:group={exportConfig.fileType}
					disabled={loading}
				/>
			{/each}
		</div>
	</div>
</Modal>
