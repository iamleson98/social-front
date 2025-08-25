<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import {
		GIFT_CARD_TAGS_QUERY,
		GIFTCARD_EXPORT_MUTATION,
		GIFTCARD_SETTINGS_QUERY,
		GIFTCARD_SETTINGS_UPDATE_MUTATION,
		GIFTCARD_TOTAL_COUNT_QUERY,
		GIFT_CARD_BULK_CREATE_MUTATION,
	} from '$lib/api/admin/giftcards';

	import { SettingCog } from '$lib/components/icons';
	import ShopCurrenciesSelect from '$lib/components/common/shop-currencies-select.svelte';
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
		type GiftCardSettingsUpdateInput,
		type Mutation,
		type MutationExportGiftCardsArgs,
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
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import z, { array, number, object, string } from 'zod';

	type Props = {
		variables: QueryGiftCardsArgs;
		selectedIds: Record<string, boolean>;
	};
	let { variables = $bindable(), selectedIds = $bindable() }: Props = $props();

	let loading = $state(false);
	let disabled = $state(false);

	let openSettingModal = $state(false);
	let openBulkIssueModal = $state(false);
	let openExportCodesModal = $state(false);
	let openExportBulkModal = $state(false);

	let activeTags = $state<string[]>([]);
	let balanceAmount = $state(0);
	let balanceCurrency = $state('');
	let cardsIssued = $state('');
	let addTags = $state<string[]>([]);
	let requiresActivation = $state(false);
	let setExpiryDate = $state(false);

	const giftcardSchema = object({
		cardsIssued: string().nonempty(CommonState.FieldRequiredError),
		addTags: array(string().nonempty(CommonState.FieldRequiredError)),
		balanceAmount: number().min(1, 'Please provide positive amount'),
		balanceCurrency: string().nonempty(CommonState.FieldRequiredError),
	});

	type GiftcardSchema = z.infer<typeof giftcardSchema>;
	let giftcardFormErrors = $state.raw<Partial<Record<keyof GiftcardSchema, string[]>>>({});

	let settingInput = $state<GiftCardSettingsUpdateInput>({
		expiryType: GiftCardSettingsExpiryTypeEnum.ExpiryPeriod,
		expiryPeriod: { amount: 0, type: TimePeriodTypeEnum.Day },
	});

	let exportConfig = $state<ExportGiftCardsInput>({
		fileType: FileTypesEnum.Xlsx,
		scope: ExportScope.All,
		filter: null,
	});

	const ExpiryTypes = Object.values(GiftCardSettingsExpiryTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLocaleLowerCase().replace(/_/g, ' '),
	}));
	const ExpiryPeriodTypes = Object.values(TimePeriodTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase().replace(/_/g, ' '),
	}));

	const GiftcardSettingsQuery = operationStore<Pick<Query, 'giftCardSettings'>>({
		query: GIFTCARD_SETTINGS_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

	const GiftcardTotalCountQuery = operationStore<Pick<Query, 'giftCards'>, QueryGiftCardsArgs>({
		query: GIFTCARD_TOTAL_COUNT_QUERY,
		requestPolicy: 'cache-and-network',
		pause: true,
	});

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
		if (
			openExportCodesModal &&
			exportConfig.scope === ExportScope.Ids &&
			(!selectedIds || Object.keys(selectedIds).length === 0)
		) {
			exportConfig.scope = ExportScope.All;
		}
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
			cardsIssued: cardsIssued,
			addTags: addTags,
			balanceAmount: balanceAmount,
			balanceCurrency: balanceCurrency,
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
		>(GIFTCARD_SETTINGS_UPDATE_MUTATION, { input: settingInput });
		loading = false;
		if (checkIfGraphqlResultHasError(result, 'giftCardSettingsUpdate', CommonState.EditSuccess))
			return;
		openSettingModal = false;
	};

	const handleBulkIssue = async () => {
		try {
			loading = true;
			const result = await GRAPHQL_CLIENT.mutation(GIFT_CARD_BULK_CREATE_MUTATION, {
				input: {
					count: parseInt(cardsIssued, 10) || 1,
					tags: activeTags,
					balance: {
						amount: balanceAmount,
						currency: balanceCurrency || 'VND',
					},
					isActive: !requiresActivation,
				},
			});

			if (result.error) {
				throw result.error;
			}

			if (result.data?.giftCardBulkCreate?.errors?.length) {
				const error = result.data.giftCardBulkCreate.errors[0];
				throw new Error(`${error.field}: ${error.message}`);
			}

			checkIfGraphqlResultHasError(result, 'giftCardBulkCreate', CommonState.CreateSuccess);

			cardsIssued = '';
			balanceAmount = 0;
			activeTags = [];
			openBulkIssueModal = false;
			openExportBulkModal = true;
			GiftcardTotalCountQuery.reexecute({ variables: {} });
		} catch (error) {
		} finally {
			loading = false;
		}
	};

	const handleExportBulk = async () => {
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'exportGiftCards'>,
			MutationExportGiftCardsArgs
		>(GIFTCARD_EXPORT_MUTATION, {
			input: exportConfig,
		});
		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'exportGiftCards',
				`We are currently exporting your requested ${exportConfig.fileType.toLowerCase()}.As soon as it is available it will be sent to your email address`,
			)
		)
			return;

		openExportBulkModal = false;
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

		if (
			checkIfGraphqlResultHasError(
				result,
				'exportGiftCards',
				`We are currently exporting your requested ${exportConfig.fileType.toLowerCase()}.As soon as it is available it will be sent to your email address`,
			)
		)
			return;

		openExportCodesModal = false;
	};

	const handleTagsChange = () => {
		if (!activeTags.length) {
			addTags = [];
			return;
		}
		addTags = difference(activeTags, []);
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
			type="number"
			placeholder="Cards issued"
			label="Cards Issued"
			class="flex-1"
			bind:value={cardsIssued}
			disabled={loading || disabled}
			required
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
			variant={giftcardFormErrors.cardsIssued?.length ? 'error' : 'info'}
			subText={giftcardFormErrors.cardsIssued?.[0]}
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
				onblur={validate}
				inputDebounceOption={{ onInput: validate }}
				variant={giftcardFormErrors.balanceAmount?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.balanceAmount?.[0]}
			/>
			<ShopCurrenciesSelect
				label="Currency"
				class="flex-1"
				required
				size="sm"
				placeholder="Currency"
				bind:value={balanceCurrency}
				disabled={loading || disabled}
				variant={giftcardFormErrors.balanceCurrency?.length ? 'error' : 'info'}
				subText={giftcardFormErrors.balanceCurrency?.[0]}
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
			disabled={loading || disabled}
		/>

		<Checkbox
			label="Set gift card expiry date"
			bind:checked={setExpiryDate}
			disabled={loading || disabled}
		/>

		{#if setExpiryDate}
			<GiftcardExpirationForm disabled={loading || disabled} size="sm" />
		{/if}

		<Checkbox
			label="Requires activation"
			bind:checked={requiresActivation}
			disabled={loading || disabled}
		/>

		<Alert size="sm" variant="info">
			We have issued all of your requested gift cards. You can download the list of new gift cards
			using the button below.
		</Alert>
	</div>
</Modal>

<Modal
	open={openExportBulkModal}
	header="Export Bulk Giftcards"
	size="sm"
	onCancel={() => (openExportBulkModal = false)}
	onClose={() => (openExportBulkModal = false)}
	closeOnEscape
	okText="Export"
	onOk={handleExportBulk}
	closeOnOutsideClick
	disableElements={loading}
>
	<Alert size="sm" variant="info">
		We are currently exporting your requested {exportConfig.fileType.toLowerCase()}.As soon as it is
		available it will be sent to your email address
	</Alert>
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
					disabled={loading || disabled}
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
					disabled={loading || disabled}
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
					disabled={loading || disabled}
				/>
			{/each}
		</div>
	</div>
</Modal>
