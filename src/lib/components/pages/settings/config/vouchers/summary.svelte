<script lang="ts">
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { DiscountValueTypeEnum, type Voucher } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	type Props = {
		voucher: Voucher;
	};

	let { voucher }: Props = $props();
</script>

<div class="rounded-lg p-3 border border-gray-200 bg-white space-y-2 text-gray-600">
	<SectionHeader>Summary</SectionHeader>

	<div class="text-sm">
		<div class="font-medium">Applies to</div>
		<div>{voucher.type.toLocaleLowerCase().split('_').join(' ')}</div>
	</div>

	<div class="text-sm">
		<div class="font-medium">Value</div>
		{#each voucher.channelListings || [] as listing, idx (idx)}
			<div class="flex items-center mb-1 justify-between">
				<Badge text={listing.channel.name} size="sm" />
				<PriceDisplay
					amount={listing.discountValue}
					currency={voucher.discountValueType === DiscountValueTypeEnum.Fixed
						? listing.currency
						: '%'}
				/>
			</div>
		{/each}
	</div>

	<div class="text-sm">
		<div class="font-medium">Start date</div>
		<div>{voucher.startDate ? dayjs(voucher.startDate).format(SitenameTimeFormat) : '-'}</div>
	</div>

	<div class="text-sm">
		<div class="font-medium">End date</div>
		<div>{voucher.endDate ? dayjs(voucher.endDate).format(SitenameTimeFormat) : '-'}</div>
	</div>

	<div class="text-sm">
		<div class="font-medium">Min order value</div>
		{#each voucher.channelListings || [] as listing, idx (idx)}
			<div class="flex items-center mb-1 justify-between">
				<Badge text={listing.channel.name} size="sm" />
				{#if listing.minSpent}
					<PriceDisplay {...listing.minSpent} />
				{:else}
					<span>-</span>
				{/if}
			</div>
		{/each}
	</div>

	<div class="text-sm">
		<div class="font-medium">Availability</div>
		<div>{voucher.channelListings?.map((item) => item.channel.name).join(', ')}</div>
	</div>
</div>
