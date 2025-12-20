<script lang="ts">
	import { T } from '$i18n';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { DiscountValueTypeEnum, type Voucher } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { APPLICATION_TYPES } from './consts';
	import dayjs from 'dayjs';

	type Props = {
		/** if not provided, meaning this is create page */
		voucher?: Voucher;
	};

	let { voucher }: Props = $props();
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('common.summary')}</SectionHeader>

	{#if voucher}
		<div class="text-sm">
			<div class="font-semibold">{$T('voucher.applies')}</div>
			<div>{$T(APPLICATION_TYPES[voucher.type])}</div>
		</div>

		<div class="text-sm">
			<div class="font-semibold">{$T('common.value')}</div>
			{#each voucher.channelListings || [] as listing, idx (idx)}
				<div class="flex items-center mb-1 justify-between">
					<Badge text={listing.channel.name} size="xs" />
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
			<div class="font-semibold">{$T('common.startAt')}</div>
			<div>{voucher.startDate ? dayjs(voucher.startDate).format(SitenameTimeFormat) : '-'}</div>
		</div>

		<div class="text-sm">
			<div class="font-semibold">{$T('common.endAt')}</div>
			<div>{voucher.endDate ? dayjs(voucher.endDate).format(SitenameTimeFormat) : '-'}</div>
		</div>

		<div class="text-sm">
			<div class="font-semibold">{$T('voucher.minOrderPrice')}</div>
			{#each voucher.channelListings || [] as listing, idx (idx)}
				<div class="flex items-center mb-1 justify-between">
					<Badge text={listing.channel.name} size="xs" />
					{#if listing.minSpent}
						<PriceDisplay {...listing.minSpent} />
					{:else}
						<span>-</span>
					{/if}
				</div>
			{/each}
		</div>

		<div class="text-sm">
			<div class="font-semibold">{$T('settings.availability')}</div>
			{#each voucher.channelListings || [] as listing}
				<a href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(listing.channel.slug)} class="link mr-1">
					{listing.channel.name}
				</a>
			{/each}
		</div>
	{/if}
</div>
