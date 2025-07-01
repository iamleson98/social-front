<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { RadioButton } from '$lib/components/ui/Input';
	import { DiscountValueTypeEnum, VoucherTypeEnum, type Voucher } from '$lib/gql/graphql';

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

	let channelIds = $state<string[]>(voucher.channelListings?.map((item) => item.channel.id) ?? []);
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2">
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
		<SectionHeader>Discount value type</SectionHeader>
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
</div>
