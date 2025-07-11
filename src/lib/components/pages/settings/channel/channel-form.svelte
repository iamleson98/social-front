<script lang="ts">
	import { tranFunc } from '$i18n';
	import CountrySelect from '$lib/components/common/country-language/country-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input, Label, RadioButton } from '$lib/components/ui/Input';
	import {
		AllocationStrategyEnum,
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type CountryCode,
	} from '$lib/gql/graphql';
	import slugify from 'slugify';
	import { boolean, number, object, string, z } from 'zod';

	type Props = {
		name: string;
		slug: string;
		disabled: boolean;
		deleteExpiredOrdersAfter: number;
		defaultCountry: CountryCode;
		isActive: boolean;
		currencyCode: string;
		allowUnpaidOrders: boolean;
		markAsPaidStrategy: MarkAsPaidStrategyEnum;
		automaticallyCompleteFullyPaidCheckouts: boolean;
		transactionFlowStrategy: TransactionFlowStrategyEnum;
		allocationStrategy: AllocationStrategyEnum;
		formOk: boolean;

		isCreatePage?: boolean;
	};

	let {
		name = $bindable(''),
		slug = $bindable(''),
		disabled,
		defaultCountry = $bindable(),
		deleteExpiredOrdersAfter = $bindable(60),
		isActive = $bindable(false),
		currencyCode = $bindable(''),
		allowUnpaidOrders = $bindable(false),
		markAsPaidStrategy = $bindable(MarkAsPaidStrategyEnum.TransactionFlow),
		automaticallyCompleteFullyPaidCheckouts = $bindable(false),
		transactionFlowStrategy = $bindable(TransactionFlowStrategyEnum.Authorization),
		allocationStrategy = $bindable(AllocationStrategyEnum.PrioritizeSortingOrder),
		formOk = $bindable(false),
		isCreatePage = false,
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const MIN_EXPIRE_DAY = 1;
	const MAX_EXPIRE_DAY = 120;
	const EXPIRE_ORDER_DEL_ERR = $tranFunc('channel.delExprOrdersErrSubTxt', {
		min: MIN_EXPIRE_DAY,
		max: MAX_EXPIRE_DAY,
	});

	const channelSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
		defaultCountry: string()
			.nonempty(REQUIRED_ERROR)
			.optional()
			.refine((val) => val !== undefined, REQUIRED_ERROR),
		orderSettings: object({
			deleteExpiredOrdersAfter: number()
				.min(MIN_EXPIRE_DAY, EXPIRE_ORDER_DEL_ERR)
				.max(MAX_EXPIRE_DAY, EXPIRE_ORDER_DEL_ERR),
		}),
		currencyCode: string().nonempty(REQUIRED_ERROR),
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});

	$effect(() => {
		formOk = !Object.keys(channelFormErrors).length;
	});

	const validate = () => {
		const parseResult = channelSchema.safeParse({
			name,
			slug,
			isActive,
			defaultCountry,
			orderSettings: {
				deleteExpiredOrdersAfter,
			},
			currencyCode,
		});
		if (!parseResult.success) {
			channelFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		channelFormErrors = {};
		return true;
	};

	const handleFormChange = (field: keyof ChannelSchema) => {
		if (field === 'name' && isCreatePage) {
			slug = slugify(name, { lower: true, strict: true });
		}
		validate();
	};
</script>

<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>

<div class="flex gap-2 items-start">
	<Input
		label={$tranFunc('common.name')}
		bind:value={name}
		inputDebounceOption={{ onInput: () => handleFormChange('name') }}
		variant={channelFormErrors?.name?.length ? 'error' : 'info'}
		subText={channelFormErrors?.name?.[0]}
		required
		{disabled}
		class="flex-1"
		onblur={validate}
	/>
	<Input
		label="Slug"
		bind:value={slug}
		class="flex-1"
		required
		variant={channelFormErrors?.slug?.length ? 'error' : 'info'}
		subText={channelFormErrors?.slug?.[0]}
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
</div>

<div class="mt-3 flex gap-3 items-center">
	<Input
		label={$tranFunc('channel.orderExp')}
		bind:value={deleteExpiredOrdersAfter}
		{disabled}
		class="flex-1"
		type="number"
		min={MIN_EXPIRE_DAY}
		max={MAX_EXPIRE_DAY}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={channelFormErrors?.orderSettings?.length ? 'error' : 'info'}
		subText={channelFormErrors?.orderSettings?.length
			? channelFormErrors.orderSettings[0]
			: $tranFunc('channel.delExprOrdersSubTxt', { min: MIN_EXPIRE_DAY, max: MAX_EXPIRE_DAY })}
	/>
	<Checkbox
		label={$tranFunc('staff.active')}
		bind:checked={isActive}
		{disabled}
		size="sm"
		class="flex-1"
	/>
</div>

<div class="mt-3 flex gap-3 items-start">
	<Input
		label={$tranFunc('common.currency')}
		bind:value={currencyCode}
		required
		variant={channelFormErrors?.currencyCode?.length ? 'error' : 'info'}
		subText={channelFormErrors?.currencyCode?.[0]}
		disabled={!isCreatePage}
		class="flex-1"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>

	<CountrySelect
		label={$tranFunc('common.country')}
		bind:value={defaultCountry}
		required
		variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
		subText={channelFormErrors?.defaultCountry?.[0]}
		{disabled}
		class="flex-1"
		onchange={validate}
		onblur={validate}
	/>
</div>

{#snippet previewLabel(label: string)}
	<div class="flex items-center gap-1">
		<span>{label}</span>
		<Badge size="xs" text={$tranFunc('settings.preview')} variant="outline" rounded />
	</div>
{/snippet}

<div class="mt-3 flex flex-col gap-1">
	<Checkbox
		bind:checked={allowUnpaidOrders}
		{disabled}
		size="sm"
		subText={$tranFunc('channel.allowCompleteOrderBeforePay')}
		class="mb-3"
	>
		{#snippet label()}
			{@render previewLabel($tranFunc('channel.allowUnpaidOrder'))}
		{/snippet}
	</Checkbox>
	<Checkbox
		{disabled}
		size="sm"
		class="mb-3"
		checked={markAsPaidStrategy === MarkAsPaidStrategyEnum.TransactionFlow}
		onchange={(evt) => {
			markAsPaidStrategy = evt.currentTarget.checked
				? MarkAsPaidStrategyEnum.TransactionFlow
				: MarkAsPaidStrategyEnum.PaymentFlow;
		}}
		subText={$tranFunc('channel.markAsPaidSubTxt')}
	>
		{#snippet label()}
			{@render previewLabel($tranFunc('channel.useTranFlow'))}
		{/snippet}
	</Checkbox>
	<Checkbox
		label={$tranFunc('channel.autoCompleteCheckoutsWhenPaid')}
		bind:checked={automaticallyCompleteFullyPaidCheckouts}
		{disabled}
		size="sm"
		class="mb-3"
		subText={$tranFunc('channel.autoCompleteCheckoutWhenPaidSubTxt')}
	></Checkbox>
	<Checkbox
		checked={transactionFlowStrategy === TransactionFlowStrategyEnum.Authorization}
		onchange={(evt) => {
			transactionFlowStrategy = evt.currentTarget.checked
				? TransactionFlowStrategyEnum.Authorization
				: TransactionFlowStrategyEnum.Charge;
		}}
		{disabled}
		size="sm"
		subText={$tranFunc('channel.authorizeTransSubTxt')}
	>
		{#snippet label()}
			{@render previewLabel($tranFunc('channel.authorizeTrans'))}
		{/snippet}
	</Checkbox>
</div>

<div class="mt-3">
	<Label label={$tranFunc('channel.allocStrategy')} />
	<RadioButton
		value={AllocationStrategyEnum.PrioritizeHighStock}
		label={$tranFunc('channel.prioritizeWarehouseWithMaxStock')}
		bind:group={allocationStrategy}
		size="sm"
		{disabled}
	/>
	<RadioButton
		value={AllocationStrategyEnum.PrioritizeSortingOrder}
		label={$tranFunc('channel.prioritizeWarehouseByMaxOrder')}
		bind:group={allocationStrategy}
		size="sm"
		{disabled}
		class="mt-2"
	/>
</div>
