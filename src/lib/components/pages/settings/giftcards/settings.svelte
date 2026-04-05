<script lang="ts">
	import { T } from '$i18n';
	import type { TranslationKey } from '$i18n/types';
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
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import GiftcardExpirationForm from './giftcard-expiration-form.svelte';
	import { camelCase } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { array, boolean, number, object, string } from 'zod';

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
		count: number().min(1, $CommonState.NonNegativeError),
		tags: array(string()),
		amount: number().min(1, $CommonState.NonNegativeError),
		currency: string().nonempty($CommonState.FieldRequiredError),
		isActive: boolean(),
		expiryDate: string().optional(),
	});
	const SchemaHandler = createSchemaHandler(giftcardSchema, () => ({
		...bulkIssueInput,
		amount: bulkIssueInput.balance.amount,
		currency: bulkIssueInput.balance.currency,
	}));

	let giftcardSettingInput = $state<GiftCardSettingsUpdateInput>({
		expiryType: GiftCardSettingsExpiryTypeEnum.ExpiryPeriod,
		expiryPeriod: {
			amount: 0,
			type: TimePeriodTypeEnum.Day,
		},
	});

	const ExpiryTypes = Object.values(GiftCardSettingsExpiryTypeEnum).map<SelectOption>((value) => ({
		value,
		label: $T(`giftcard.expiryType.${camelCase(value)}` as TranslationKey),
	}));
	const ExpiryPeriodTypes = Object.values(TimePeriodTypeEnum).map<SelectOption>((value) => ({
		value,
		label: $T(`giftcard.periodType.${camelCase(value)}` as TranslationKey),
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

		if (checkIfGraphqlResultHasError(result, 'giftCardSettingsUpdate', $CommonState.EditSuccess))
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

		if (checkIfGraphqlResultHasError(result, 'giftCardBulkCreate', $CommonState.CreateSuccess))
			return;

		bulkIssueInput = createDefaultBulkIssueInput(); // reset form

		let giftcardIssuedIds: string[] = [];
		if (result.data?.giftCardBulkCreate?.giftCards) {
			giftcardIssuedIds = result.data.giftCardBulkCreate.giftCards.map((card) => card.id);
		}

		openBulkIssueModal = false;

		if (giftcardIssuedIds.length)
			AlertModalStore.openAlertModal({
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

					if (checkIfGraphqlResultHasError(result, 'exportGiftCards', $T('common.fileExporting')))
						return;
				},
				content: $T('giftcard.events.bulkIssueSuccess'),
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

		if (checkIfGraphqlResultHasError(result, 'exportGiftCards', $CommonState.CreateSuccess)) return;

		openExportCodesModal = false;
		selectedIds = {}; // reset ids
	};

	const SettingOptions: MenuItemProps[] = [
		{ children: $T('common.settings'), onclick: handleClickOpenSetting },
		{ children: $T('giftcard.bulkIssue'), onclick: () => (openBulkIssueModal = true) },
		{
			children: $T('giftcard.exportCodes'),
			onclick: () => {
				openExportCodesModal = true;
				GiftcardTotalCountQuery.reexecute({ variables: {} });
			},
		},
	];
</script>

<DropDown placement="bottom-end" options={SettingOptions}>
	{#snippet trigger({ onclick })}
		<IconButton
			icon={SettingCog}
			{onclick}
			color="gray"
			size="sm"
			aria-label={$T('common.settings')}
			data-tip={$T('common.settings')}
			class="tooltip tooltip-left"
			disabled={loading}
		/>
	{/snippet}
</DropDown>

<!-- MARK: Setting modal -->
<Modal
	open={openSettingModal}
	header={$T('common.settings')}
	onCancel={() => (openSettingModal = false)}
	onClose={() => (openSettingModal = false)}
	onOk={handleUpdateSettings}
	disableElements={loading}
	size="sm"
	closeOnEscape
	closeOnOutsideClick
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
				label={$T('giftcard.form.expiryType')}
				bind:value={giftcardSettingInput.expiryType!}
				placeholder="Select type"
			/>

			{#if giftcardSettingInput.expiryType === GiftCardSettingsExpiryTypeEnum.ExpiryPeriod}
				<div class="grid grid-cols-2 gap-2">
					<Input
						type="number"
						disabled={loading}
						bind:value={giftcardSettingInput.expiryPeriod!.amount}
						placeholder={$T('giftcard.duration')}
						label={$T('giftcard.duration')}
						required
					/>
					<Select
						disabled={loading}
						options={ExpiryPeriodTypes}
						label={$T('giftcard.form.unit')}
						placeholder={$T('giftcard.form.unit')}
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
	header={$T('giftcard.bulkIssue')}
	onCancel={() => (openBulkIssueModal = false)}
	onClose={() => (openBulkIssueModal = false)}
	onOk={handleBulkIssue}
	size="sm"
	disableElements={loading}
	closeOnEscape
	closeOnOutsideClick
>
	<div class="space-y-2">
		<Alert>
			{$T('giftcard.bulkIssueAlert')}
		</Alert>
		<Input
			type="number"
			placeholder={$T('product.quantity')}
			label={$T('product.quantity')}
			class="flex-1"
			bind:value={bulkIssueInput.count}
			disabled={loading}
			required
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.count?.length ? 'error' : 'info'}
			subText={$SchemaHandler.count?.[0]}
		/>
		<div class="flex items-start gap-2">
			<Input
				type="number"
				min={1}
				placeholder={$T('giftcard.form.amount')}
				label={$T('giftcard.form.amount')}
				class="flex-1"
				bind:value={bulkIssueInput.balance.amount}
				disabled={loading}
				required
				onblur={SchemaHandler.validate}
				inputDebounceOption={{ onInput: SchemaHandler.validate }}
				variant={$SchemaHandler.amount?.length ? 'error' : 'info'}
				subText={$SchemaHandler.amount?.[0]}
			/>
			<ShopCurrenciesSelect
				label={$T('common.currency')}
				class="flex-1"
				required
				placeholder={$T('common.currency')}
				bind:value={bulkIssueInput.balance.currency}
				disabled={loading}
				onblur={SchemaHandler.validate}
				onchange={SchemaHandler.validate}
				variant={$SchemaHandler.currency?.length ? 'error' : 'info'}
				subText={$SchemaHandler.currency?.[0]}
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
			label={$T('giftcard.form.tags')}
			placeholder={$T('giftcard.form.tags')}
			bind:value={bulkIssueInput.tags}
			disabled={loading}
		/>
		<GiftcardExpirationForm bind:expiryDate={bulkIssueInput.expiryDate} disabled={loading} />
		<Checkbox
			label={$T('staff.active')}
			bind:checked={bulkIssueInput.isActive}
			disabled={loading}
		/>
	</div>
</Modal>

<!-- MARK: Export codes modal -->
<Modal
	header={$T('giftcard.exportCodes')}
	open={openExportCodesModal}
	onCancel={() => (openExportCodesModal = false)}
	onClose={() => (openExportCodesModal = false)}
	closeOnEscape
	okText={$T('giftcard.exportCodes')}
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
			<Label label={$T('giftcard.exportInfo')} />
			<div class="space-y-2">
				<RadioButton
					value={ExportScope.All}
					label={`${$T('giftcard.exportAll')} (${$GiftcardTotalCountQuery.data.giftCards?.totalCount})`}
					bind:group={exportConfig.scope}
					disabled={loading}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Ids}
					label={`${$T('giftcard.exportSelected')} (${selectedIds ? Object.keys(selectedIds).length : 0})`}
					bind:group={exportConfig.scope}
					disabled={selectedIds ? Object.keys(selectedIds).length === 0 : false}
					size="sm"
				/>
				<RadioButton
					value={ExportScope.Filter}
					label={$T('giftcard.exportSearch')}
					bind:group={exportConfig.scope}
					disabled={loading}
					size="sm"
				/>
			</div>
		{/if}

		<Label label={$T('giftcard.exportAs')} />
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
