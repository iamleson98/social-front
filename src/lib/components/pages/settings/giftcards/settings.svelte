<script lang="ts">
	import {
		GIFT_CARD_TAGS_QUERY,
		GIFTCARD_SETTINGS_QUERY,
		GIFTCARD_SETTINGS_UPDATE_MUTATION,
		GIFTCARD_TOTAL_COUNT_QUERY,
		GIFT_CARD_BULK_CREATE_MUTATION,
		GIFTCARD_EXPORT_MUTATION,
	} from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
	import { SettingCog } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import { Checkbox, CheckboxSkeleton, Input, Label, RadioButton } from '$lib/components/ui/Input';
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
		type GiftCardBulkCreateInput,
		type GiftCardSettingsUpdateInput,
		type Mutation,
		type MutationExportGiftCardsArgs,
		type MutationGiftCardBulkCreateArgs,
		type MutationGiftCardSettingsUpdateArgs,
		type Query,
		type QueryGiftCardsArgs,
		type QueryGiftCardTagsArgs,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import z, { array, boolean, number, object, string } from 'zod';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';

	type Props = {
		variables: QueryGiftCardsArgs;
		selectedIds: Record<string, boolean>;
	};

	let { variables = $bindable(), selectedIds = $bindable() }: Props = $props();

	const GiftcardSettingsQuery = operationStore<Pick<Query, 'giftCardSettings'>>({
		query: GIFTCARD_SETTINGS_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true, // only execute when user choose to open setting modal
	});

	let loading = $state(false);
	let openSettingModal = $state(false);
	let openBulkIssueModal = $state(false);
	let openExportCodesModal = $state(false);

	const createDefaultBulkIssueInput = () => ({
		count: 1,
		tags: [],
		balance: {
			amount: 0,
			currency: '',
		},
		isActive: false,
		expiryDate: '',
	});

	let bulkIssueInput = $state<GiftCardBulkCreateInput>(createDefaultBulkIssueInput());

	const giftcardSchema = object({
		count: number().min(1, CommonState.NonNegativeError),
		tags: array(string()),
		amount: number().min(1, CommonState.NonNegativeError),
		currency: string().nonempty(CommonState.FieldRequiredError),
		isActive: boolean(),
		expiryDate: string().optional(),
	});

	type GiftcardSchema = z.infer<typeof giftcardSchema>;
	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardSchema, string[]>>>({});

	let giftcardSettingInput = $state<GiftCardSettingsUpdateInput>({
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
		label: value.toLowerCase(),
	}));

	onMount(() =>
		GiftcardSettingsQuery.subscribe((result) => {
			if (result.data?.giftCardSettings) {
				const { expiryType, expiryPeriod } = result.data.giftCardSettings;
				giftcardSettingInput = {
					expiryType,
					expiryPeriod: {
						amount: expiryPeriod?.amount || 0,
						type: expiryPeriod?.type || TimePeriodTypeEnum.Day,
					},
				};
			}
		}),
	);

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

	const validate = () => {
		const parseResult = giftcardSchema.safeParse({
			...bulkIssueInput,
			amount: bulkIssueInput.balance.amount,
			currency: bulkIssueInput.balance.currency,
		});
		giftcardFormErrors = parseResult.success ? {} : parseResult.error?.formErrors.fieldErrors;
		return parseResult.success;
	};

	const handleClickOpenSetting = () => {
		openSettingModal = true;
		GiftcardSettingsQuery.reexecute({ variables: {} });
		exportConfig = { fileType: FileTypesEnum.Xlsx, scope: ExportScope.All, filter: null };
	};

	const handleUpdateSettings = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardSettingsUpdate'>,
			MutationGiftCardSettingsUpdateArgs
		>(GIFTCARD_SETTINGS_UPDATE_MUTATION, { input: giftcardSettingInput });
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardSettingsUpdate', CommonState.EditSuccess))
			return;

		openSettingModal = false;
	};

	const handleBulkIssue = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardBulkCreate'>,
			MutationGiftCardBulkCreateArgs
		>(GIFT_CARD_BULK_CREATE_MUTATION, {
			input: bulkIssueInput,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardBulkCreate', CommonState.CreateSuccess))
			return;

		bulkIssueInput = createDefaultBulkIssueInput(); // reset form

		let giftcardIssuedIds: string[] = [];
		if (result.data?.giftCardBulkCreate?.giftCards) {
			giftcardIssuedIds = result.data.giftCardBulkCreate.giftCards.map((card) => card.id);
		}

		openBulkIssueModal = false;

		if (giftcardIssuedIds.length)
			ALERT_MODAL_STORE.openAlertModal({
				variant: 'info',
				onOk: async () => {
					loading = true;
					const result = await GRAPHQL_CLIENT.mutation<
						Pick<Mutation, 'exportGiftCards'>,
						MutationExportGiftCardsArgs
					>(GIFTCARD_EXPORT_MUTATION, {
						input: {
							scope: ExportScope.Ids,
							ids: giftcardIssuedIds,
							fileType: FileTypesEnum.Xlsx,
						},
					});
					loading = false;

					if (
						checkIfGraphqlResultHasError(
							result,
							'exportGiftCards',
							`We are currently exporting your requested excel file. As soon as it is available it will be sent to your email address`,
						)
					)
						return;
				},
				content:
					'We have issued all of your requested gift cards. You can download the list of new gift cards by clicking the ok button below.',
			});
	};

	const handleExportCodes = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'exportGiftCards'>,
			MutationExportGiftCardsArgs
		>(GIFTCARD_EXPORT_MUTATION, {
			input: exportConfig,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'exportGiftCards', CommonState.CreateSuccess)) return;

		openExportCodesModal = false;
		selectedIds = {}; // reset ids
	};

	const SettingOptions: MenuItemProps[] = [
		{ children: 'Settings', onclick: handleClickOpenSetting },
		{ children: 'Bulk issue', onclick: () => (openBulkIssueModal = true) },
		{
			children: 'Export card codes',
			onclick: () => {
				openExportCodesModal = true;
				GiftcardTotalCountQuery.reexecute({ variables: {} });
			},
		},
	];
</script>

<DropDown placement="bottom-end" options={SettingOptions}>
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<IconButton
			icon={SettingCog}
			{onclick}
			color="gray"
			size="sm"
			aria-label="Settings"
			data-tip="Settings"
			class="tooltip tooltip-left"
			disabled={loading}
		/>
	{/snippet}
</DropDown>

<!-- MARK: Setting modal -->
<Modal
	open={openSettingModal}
	header="Giftcard settings"
	onCancel={() => (openSettingModal = false)}
	onClose={() => (openSettingModal = false)}
	onOk={handleUpdateSettings}
	disableElements={loading}
	size="sm"
>
	{#if $GiftcardSettingsQuery.fetching}
		<SelectSkeleton label />
	{:else if $GiftcardSettingsQuery.error}
		<Alert variant="error">{$GiftcardSettingsQuery.error.message}</Alert>
	{:else if $GiftcardSettingsQuery.data?.giftCardSettings}
		<div class="space-y-2">
			<Select
				required
				disabled={loading}
				options={ExpiryTypes}
				label="Expiry type"
				bind:value={giftcardSettingInput.expiryType!}
				placeholder="Select type"
			/>

			{#if giftcardSettingInput.expiryType === GiftCardSettingsExpiryTypeEnum.ExpiryPeriod}
				<div class="grid grid-cols-2 gap-2">
					<Input
						type="number"
						disabled={loading}
						bind:value={giftcardSettingInput.expiryPeriod!.amount}
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
						bind:value={giftcardSettingInput.expiryPeriod!.type}
					/>
				</div>
			{/if}
		</div>
	{/if}
</Modal>

<!-- MARK: Bulk issue modal -->
<Modal
	open={openBulkIssueModal}
	header="Bulk Issue Gift Cards"
	onCancel={() => (openBulkIssueModal = false)}
	onClose={() => (openBulkIssueModal = false)}
	onOk={handleBulkIssue}
	size="sm"
	disableElements={loading}
>
	<div class="space-y-2">
		<Input
			type="number"
			placeholder="Cards issued"
			label="Cards Issued"
			class="flex-1"
			bind:value={bulkIssueInput.count}
			disabled={loading}
			required
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
			variant={giftcardFormErrors.count?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.count?.[0]}
		/>
		<div class="flex items-start gap-2">
			<Input
				type="number"
				min={1}
				placeholder="Set balance amount"
				label="Balance amount"
				class="flex-1"
				bind:value={bulkIssueInput.balance.amount}
				disabled={loading}
				required
				onblur={validate}
				inputDebounceOption={{ onInput: validate }}
				variant={giftcardFormErrors.amount?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.amount?.[0]}
			/>
			<ShopCurrenciesSelect
				label="Currency"
				class="flex-1"
				required
				placeholder="Currency"
				bind:value={bulkIssueInput.balance.currency}
				disabled={loading}
				onblur={validate}
				onchange={validate}
				variant={giftcardFormErrors.currency?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.currency?.[0]}
			/>
		</div>
		<GraphqlPaginableSelect
			query={GIFT_CARD_TAGS_QUERY}
			variables={{ first: 20, filter: { search: '' } } as QueryGiftCardTagsArgs}
			resultKey="giftCardTags"
			variableSearchQueryPath="filter.search"
			optionValueKey="name"
			optionLabelKey="name"
			requestPolicy="cache-and-network"
			multiple
			label="Giftcard Tags"
			placeholder="Giftcard tags"
			bind:value={bulkIssueInput.tags}
			disabled={loading}
		/>
		<GiftcardExpirationForm bind:expiryDate={bulkIssueInput.expiryDate} disabled={loading} />
		<Checkbox label="Is active" bind:checked={bulkIssueInput.isActive} disabled={loading} />
		<Alert>
			After creation Saleor will create a list of gift card codes that you will be able to download.
		</Alert>
	</div>
</Modal>

<!-- MARK: Export codes modal -->
<Modal
	header="Export Giftcards"
	open={openExportCodesModal}
	onCancel={() => (openExportCodesModal = false)}
	onClose={() => (openExportCodesModal = false)}
	closeOnEscape
	okText="Export"
	onOk={handleExportCodes}
	closeOnOutsideClick
	disableElements={loading}
	size="sm"
>
	<div class="space-y-3">
		{#if $GiftcardTotalCountQuery.fetching}
			<div class="flex flex-col gap-1.5">
				<CheckboxSkeleton label />
				<CheckboxSkeleton label />
			</div>
		{:else if $GiftcardTotalCountQuery.error}
			<Alert variant="error">{$GiftcardTotalCountQuery.error.message}</Alert>
		{:else if $GiftcardTotalCountQuery.data}
			<Label label="Export information for" />
			<div class="space-y-2">
				<RadioButton
					value={ExportScope.All}
					label={`All giftcards (${$GiftcardTotalCountQuery.data.giftCards?.totalCount})`}
					bind:group={exportConfig.scope}
					disabled={loading}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Ids}
					label={`Selected giftcards (${selectedIds ? Object.keys(selectedIds).length : 0})`}
					bind:group={exportConfig.scope}
					disabled={selectedIds ? Object.keys(selectedIds).length === 0 : false}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Filter}
					label={`Current search`}
					bind:group={exportConfig.scope}
					disabled={loading}
					size="sm"
				/>
			</div>
		{/if}

		<Label label="Export as" />
		<div class="space-y-2">
			{#each Object.values(FileTypesEnum) as value, idx (idx)}
				<RadioButton
					{value}
					label={value.toLowerCase()}
					bind:group={exportConfig.fileType}
					disabled={loading}
					size="sm"
				/>
			{/each}
		</div>
	</div>
</Modal>
