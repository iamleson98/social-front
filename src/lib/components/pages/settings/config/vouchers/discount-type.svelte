<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox, Input, RadioButton } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		DiscountValueTypeEnum,
		VoucherDiscountType,
		VoucherTypeEnum,
		type Voucher,
		type VoucherChannelListing,
	} from '$lib/gql/graphql';
	import VoucherProductApplication from './voucher-product-application.svelte';
	import { type Snippet } from 'svelte';

	type Props = {
		discountType: DiscountValueTypeEnum;
		voucher: Voucher;
		applicationType: VoucherTypeEnum;
		applyOncePerOrder: boolean;
		minimumQuantityOfItems?: number;
		minimumOrderValue?: number;
		applyOncePerCustomer: boolean;
		onlyForStaff: boolean;
		singleUse: boolean;
		usageLimit?: number;
	};

	type UsageProps = {
		title: string;
		onCheck: (checked: boolean) => void;
		value: boolean;
		child?: Snippet;
	};

	type RequirementType = 'Minimum order value' | 'Minimum quantity of items' | 'none';

	let {
		discountType = $bindable(),
		voucher,
		applicationType = $bindable(),
		applyOncePerOrder = $bindable(),
		minimumQuantityOfItems = $bindable(),
		minimumOrderValue = $bindable(),
		applyOncePerCustomer = $bindable(),
		onlyForStaff = $bindable(),
		singleUse = $bindable(),
		usageLimit = $bindable(),
	}: Props = $props();

	const DISCOUNT_TYPE_SHIPPING = 'Shipping' as DiscountValueTypeEnum;

	const VOUCHER_TYPES: DiscountValueTypeEnum[] = [
		DiscountValueTypeEnum.Fixed,
		DiscountValueTypeEnum.Percentage,
		DISCOUNT_TYPE_SHIPPING,
	];

	const APPLICATION_TYPES = [VoucherTypeEnum.EntireOrder, VoucherTypeEnum.SpecificProduct];
	const REQUIREMENT_TYPES: RequirementType[] = [
		'none',
		'Minimum order value',
		'Minimum quantity of items',
	];

	let channelIds = $state<string[]>(voucher.channelListings?.map((item) => item.channel.id) ?? []);
	let requirementType = $state<RequirementType>('none');
	let limitNumberOfTimesUsed = $state(false);
	// let limitToOneUsePerCustomer = $state(false);
	// let limitToStaffOnly = $state(false);
	// let limitToVoucherCodeUseOnce = $state(false);

	const CHANNEL_LISTING_COLUMNS: TableColumnProps<VoucherChannelListing>[] = [
		{
			title: 'Channel',
			child: channel,
		},
		{
			title: 'Price',
			child: price,
		},
	];

	const USAGE_PROPS: UsageProps[] = $derived([
		{
			title: 'Limit number of times this discount can be used in total',
			onCheck: (checked) => (limitNumberOfTimesUsed = checked),
			value: limitNumberOfTimesUsed,
			child: numOfUsesLimit,
		},
		{
			title: 'Limit to one use per customer',
			onCheck: (checked) => (applyOncePerCustomer = checked),
			value: applyOncePerCustomer,
		},
		{
			title: 'Limit to staff only',
			onCheck: (checked) => (onlyForStaff = checked),
			value: onlyForStaff,
		},
		{
			title: 'Limit to voucher code use once',
			onCheck: (checked) => (singleUse = checked),
			value: singleUse,
		},
	]);
</script>

{#snippet channel({ item }: { item: VoucherChannelListing })}
	<Badge text={item.channel.slug} />
{/snippet}

{#snippet price({ item }: { item: VoucherChannelListing })}
	<Input value={item.discountValue} placeholder="Discount value" type="number" min="0">
		{#snippet action()}
			{#if discountType === DiscountValueTypeEnum.Fixed}
				<span class="text-xs font-semibold text-gray-600">{item.channel.currencyCode}</span>
			{:else if discountType === DiscountValueTypeEnum.Percentage}
				<span class="text-xs font-semibold text-gray-600">%</span>
			{/if}
		{/snippet}
	</Input>
{/snippet}

{#snippet numOfUsesLimit()}
	<div class="flex items-center gap-2">
		<Input bind:value={usageLimit} placeholder="Usage limit" type="number" min={voucher.used} label="Usage limit" />
		<span
			>{typeof usageLimit === 'number' && usageLimit > voucher.used
				? `${usageLimit - voucher.used} uses left`
				: '0 uses left'}</span
		>
	</div>
{/snippet}

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-3.5">
	<div>
		<SectionHeader>Availability</SectionHeader>
		<ChannelSelect
			valueType="id"
			bind:value={channelIds}
			label="Specify channels"
			required
			multiple
		/>
	</div>

	<div>
		<SectionHeader>Discount type</SectionHeader>
		<div class="space-y-2.5">
			{#each VOUCHER_TYPES as type, idx (idx)}
				<RadioButton
					label={type.toLocaleLowerCase().split('_').join(' ')}
					bind:group={discountType}
					value={type}
				/>
			{/each}
		</div>
	</div>

	{#if discountType !== DISCOUNT_TYPE_SHIPPING}
		<div>
			<SectionHeader>Value</SectionHeader>
			<Table columns={CHANNEL_LISTING_COLUMNS} items={voucher.channelListings ?? []} />
		</div>

		<div>
			<SectionHeader>Application type</SectionHeader>
			<div class="space-y-2.5">
				{#each APPLICATION_TYPES as type, idx (idx)}
					<RadioButton
						label={type.toLocaleLowerCase().split('_').join(' ')}
						bind:group={applicationType}
						value={type}
					/>
				{/each}

				<Checkbox
					label="Apply only to a single cheapest eligible product"
					subText="If this option is unchecked, discount will be counted for every eligible product"
					bind:checked={applyOncePerOrder}
				/>
			</div>
		</div>
		{#if applicationType === VoucherTypeEnum.SpecificProduct}
			<VoucherProductApplication />
		{/if}
	{/if}

	<div>
		<SectionHeader>Minimum requirements</SectionHeader>
		<div class="space-y-2.5 mb-2">
			{#each REQUIREMENT_TYPES as type, idx (idx)}
				<RadioButton label={type} bind:group={requirementType} value={type} />
			{/each}
		</div>

		{#if requirementType === 'Minimum order value'}
			<Input
				placeholder="Minimum order value"
				type="number"
				min={0}
				bind:value={minimumOrderValue}
			/>
		{:else if requirementType === 'Minimum quantity of items'}
			<Input
				placeholder="Minimum quantity of items"
				type="number"
				min={0}
				bind:value={minimumQuantityOfItems}
			/>
		{/if}
	</div>

	<div>
		<SectionHeader>Usage limit</SectionHeader>
		<div class="space-y-2.5">
			{#each USAGE_PROPS as prop, idx (idx)}
				<Checkbox
					label={prop.title}
					checked={prop.value}
					onchange={(evt) => prop.onCheck(evt.currentTarget.checked)}
				/>
				{@render prop.child?.()}
			{/each}
		</div>
	</div>
</div>
