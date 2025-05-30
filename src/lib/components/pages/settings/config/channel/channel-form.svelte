<script lang="ts">
	import { tranFunc } from '$i18n';
	import { operationStore } from '$lib/api/operation';
	import { SHOP_QUERY } from '$lib/api/shop';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, Label, RadioButton } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import {
		AllocationStrategyEnum,
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type CountryCode,
		type Query
	} from '$lib/gql/graphql';
	import slugify from 'slugify';
	import { boolean, number, object, string, z } from 'zod';

	type Props = {
		name: string;
		slug: string;
		disabled: boolean;
		deleteExpiredOrdersAfter: unknown;
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
		isCreatePage = false
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const MIN_EXPIRE_DAY = 1;
	const MAX_EXPIRE_DAY = 120;

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
				.min(MIN_EXPIRE_DAY, `Must be >= ${MIN_EXPIRE_DAY}`)
				.max(MAX_EXPIRE_DAY, `Must be <= ${MAX_EXPIRE_DAY}`)
		}),
		currencyCode: string().nonempty(REQUIRED_ERROR)
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});

	$effect(() => {
		formOk = !Object.keys(channelFormErrors).length;
	});

	const shopQuery = operationStore<Pick<Query, 'shop'>>({
		kind: 'query',
		query: SHOP_QUERY,
		requestPolicy: 'cache-and-network'
	});

	const validate = () => {
		const parseResult = channelSchema.safeParse({
			name,
			slug,
			isActive,
			defaultCountry,
			orderSettings: {
				deleteExpiredOrdersAfter
			},
			currencyCode
		});
		if (!parseResult.success) {
			channelFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		channelFormErrors = {};
		return true;
	};

	const handleFormChange = (field: keyof ChannelSchema) => {
		if (field === 'name' && typeof name === 'string') {
			slug = slugify(name, { lower: true });
		}
		validate();
	};
</script>

<SectionHeader>General Information</SectionHeader>

<div class="flex gap-2 items-start">
	<Input
		label="Name"
		bind:value={name}
		inputDebounceOption={{ onInput: () => handleFormChange('name') }}
		variant={channelFormErrors?.name?.length ? 'error' : 'info'}
		subText={channelFormErrors?.name?.length ? channelFormErrors.name[0] : ''}
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
		subText={channelFormErrors?.slug?.length ? channelFormErrors.slug[0] : ''}
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
</div>

<div class="mt-3 flex gap-3 items-center">
	<Input
		label="Order expiration"
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
			: `The time in days after expired orders will be deleted. Allowed range between ${MIN_EXPIRE_DAY} and ${MAX_EXPIRE_DAY}.`}
	/>
	<Checkbox label="Active" bind:checked={isActive} {disabled} size="sm" class="flex-1" />
</div>

<div class="mt-3 flex gap-3 items-start">
	<Input
		label="Currency"
		bind:value={currencyCode}
		required
		variant={channelFormErrors?.currencyCode?.length ? 'error' : 'info'}
		subText={channelFormErrors?.currencyCode?.length ? channelFormErrors.currencyCode[0] : ''}
		disabled={!isCreatePage}
		class="flex-1"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>
	<div class="flex-1">
		{#if $shopQuery.fetching}
			<SkeletonContainer class="flex gap-3">
				<Skeleton class="h-5 flex-1" />
				<Skeleton class="h-5 flex-1" />
			</SkeletonContainer>
		{:else if $shopQuery.error}
			<Alert variant="error" size="sm" bordered>{$shopQuery.error.message}</Alert>
		{:else if $shopQuery.data?.shop}
			{@const countriesOpts = $shopQuery.data.shop.countries.map<SelectOption>((country) => ({
				value: country.code,
				label: country.country
			}))}
			<Select
				label="Country"
				options={countriesOpts}
				placeholder="Select a country"
				bind:value={defaultCountry}
				required
				variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
				subText={channelFormErrors?.defaultCountry?.length
					? channelFormErrors.defaultCountry[0]
					: ''}
				{disabled}
				onchange={validate}
				onblur={validate}
			/>
		{/if}
	</div>
</div>

<div class="mt-3 flex flex-col gap-1">
	<Checkbox
		label="Allow unpaid orders"
		bind:checked={allowUnpaidOrders}
		{disabled}
		size="sm"
		subText={`Enables completing checkout with order before a successful payment. <div class="badge badge-outline badge-xs badge-info">Preview</div>`}
		class="mb-3"
	/>
	<Checkbox
		label="Use Transaction flow when marking order as paid"
		{disabled}
		size="sm"
		class="mb-3"
		checked={markAsPaidStrategy === MarkAsPaidStrategyEnum.TransactionFlow}
		onchange={(evt) => {
			markAsPaidStrategy = evt.currentTarget.checked
				? MarkAsPaidStrategyEnum.TransactionFlow
				: MarkAsPaidStrategyEnum.PaymentFlow;
		}}
		subText={`"Mark as paid" feature creates a Transaction - used by Payment Apps. <br /> If left unchecked it creates a Payment - used by Payment Plugins. <div class="badge badge-outline badge-xs badge-info">Preview</div>`}
	/>
	<Checkbox
		label="Automatically complete checkouts when fully paid"
		bind:checked={automaticallyCompleteFullyPaidCheckouts}
		{disabled}
		size="sm"
		class="mb-3"
		subText="When enabled, checkouts detected as fully paid will be completed automatically, without checkoutComplete mutation."
	/>
	<Checkbox
		label="Authorize transaction instead of charging"
		checked={transactionFlowStrategy === TransactionFlowStrategyEnum.Authorization}
		onchange={(evt) => {
			transactionFlowStrategy = evt.currentTarget.checked
				? TransactionFlowStrategyEnum.Authorization
				: TransactionFlowStrategyEnum.Charge;
		}}
		{disabled}
		size="sm"
		subText={`When enabled, all transactions would require an additional step to be charged. <div class="badge badge-outline badge-xs badge-info">Preview</div>`}
	/>
</div>

<div class="mt-3">
	<Label label="Allocation strategy" />
	<RadioButton
		value={AllocationStrategyEnum.PrioritizeHighStock}
		label="Prioritize warehouses with highest stock"
		bind:group={allocationStrategy}
		size="sm"
		{disabled}
	/>
	<RadioButton
		value={AllocationStrategyEnum.PrioritizeSortingOrder}
		label="Prioritize warehouses by sorting order"
		bind:group={allocationStrategy}
		size="sm"
		{disabled}
		class="mt-2"
	/>
</div>
