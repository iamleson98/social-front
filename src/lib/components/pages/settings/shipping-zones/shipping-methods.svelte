<script lang="ts">
	import { page } from '$app/state';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { ShippingMethodTypeEnum, type ShippingMethodType } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { classNames, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		shippingMethods?: ShippingMethodType[];
	};

	let { shippingMethods = [] }: Props = $props();

	let priceBasedMethods = shippingMethods.filter(
		(item) => item.type === ShippingMethodTypeEnum.Price,
	);

	const PriceBasedColumns: TableColumnProps<ShippingMethodType>[] = [
		{
			title: 'name',
			child: name,
		},
		{
			title: 'value range',
			child: valueRange,
		},
		{
			title: 'price',
			child: price,
		},
		{
			title: 'action',
			child: action,
		},
	];
</script>

{#snippet name({ item }: { item: ShippingMethodType })}
	<a
		href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_DETAILS(page.params.id, item.id)}
		class="link">{item.name}</a
	>
{/snippet}

{#snippet valueRange({ item }: { item: ShippingMethodType })}
	{#each item.channelListings || [] as listing, idx (idx)}
		<div class="flex items-center gap-1">
			{#if listing.minimumOrderPrice}
				<PriceDisplay {...listing.minimumOrderPrice} />
			{:else}
				<span>-</span>
			{/if}
			{#if listing.maximumOrderPrice}
				<PriceDisplay {...listing.maximumOrderPrice} />
			{:else}
				<span>-</span>
			{/if}
		</div>
	{/each}
{/snippet}

{#snippet price({ item }: { item: ShippingMethodType })}
	{#each item.channelListings || [] as listing, idx (idx)}
		{#if listing.price}
			<PriceDisplay {...listing.price} />
		{:else}
			<span>-</span>
		{/if}
	{/each}
{/snippet}

{#snippet action({ item }: { item: ShippingMethodType })}
	<IconButton icon={Trash} size="xs" variant="light" color="red" />
{/snippet}

<div class={classNames(SitenameCommonClassName, 'space-y-2')}>
	<SectionHeader>
		<div>Price based methods</div>

		<Button
			endIcon={Plus}
			variant="light"
			size="xs"
			href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW(page.params.id)}
			>Create method</Button
		>
	</SectionHeader>

	<Table columns={PriceBasedColumns} items={priceBasedMethods} />
</div>
