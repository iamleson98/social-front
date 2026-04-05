<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { DELETE_SHIPPING_METHOD_MUTATION } from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import WeightDisplay from '$lib/components/common/weight-display.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		ShippingMethodTypeEnum,
		type Mutation,
		type MutationShippingPriceDeleteArgs,
		type ShippingMethodType,
	} from '$lib/gql/graphql';
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		shippingMethods?: ShippingMethodType[];
		disabled?: boolean;
		onDoneUpdate?: () => void;
	};

	let { shippingMethods = [], disabled, onDoneUpdate }: Props = $props();

	const PriceBasedMethods = shippingMethods.filter(
		(item) => item.type === ShippingMethodTypeEnum.Price,
	);
	const WeightBasedMethods = shippingMethods.filter(
		(item) => item.type === ShippingMethodTypeEnum.Weight,
	);
	let loading = $state(false);

	const PriceBasedColumns: TableColumnProps<ShippingMethodType>[] = $derived([
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('common.valueRange'),
			child: valueRange,
		},
		{
			title: $T('common.price'),
			child: price,
		},
		{
			title: $T('common.action'),
			child: action,
		},
	]);

	const WeightBasedColumns: TableColumnProps<ShippingMethodType>[] = $derived([
		{
			title: $T('common.name'),
			child: name,
		},
		{
			title: $T('common.weightRange'),
			child: weightRange,
		},
		{
			title: $T('common.price'),
			child: price,
		},
		{
			title: $T('common.action'),
			child: action,
		},
	]);

	const handleDeleteMethod = (id: string) => {
		AlertModalStore.openAlertModal({
			content: $T('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'shippingPriceDelete'>,
					MutationShippingPriceDeleteArgs
				>(DELETE_SHIPPING_METHOD_MUTATION, { id });

				loading = false;

				if (checkIfGraphqlResultHasError(result, 'shippingPriceDelete', $T('common.delSuccess')))
					return;

				onDoneUpdate?.();
			},
		});
	};
</script>

{#snippet name({ item }: { item: ShippingMethodType })}
	<a
		href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_DETAILS(page.params.id!, item.id)}
		class="link">{item.name}</a
	>
{/snippet}

{#snippet valueRange({ item }: { item: ShippingMethodType })}
	{#each item.channelListings || [] as listing, idx (idx)}
		<div class="flex items-center gap-1">
			{#if listing.minimumOrderPrice}
				<PriceDisplay {...listing.minimumOrderPrice} />
			{:else}
				<span>?</span>
			{/if}
			<span>-</span>
			{#if listing.maximumOrderPrice}
				<PriceDisplay {...listing.maximumOrderPrice} />
			{:else}
				<span>?</span>
			{/if}
		</div>
	{/each}
{/snippet}

{#snippet weightRange({ item }: { item: ShippingMethodType })}
	<div class="flex items-center gap-1">
		{#if item.minimumOrderWeight}
			<WeightDisplay amount={item.minimumOrderWeight.value} unit={item.minimumOrderWeight.unit} />
		{:else}
			<span>?</span>
		{/if}
		<span>-</span>
		{#if item.maximumOrderWeight}
			<WeightDisplay amount={item.maximumOrderWeight.value} unit={item.maximumOrderWeight.unit} />
		{:else}
			<span>?</span>
		{/if}
	</div>
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
	<IconButton
		icon={Trash}
		size="xs"
		variant="light"
		color="red"
		onclick={() => handleDeleteMethod(item.id)}
		disabled={disabled || loading}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('ship.priceMethods')}</div>

		<Button
			endIcon={Plus}
			variant="light"
			size="xs"
			href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW(
				page.params.id!,
				ShippingMethodTypeEnum.Price,
			)}
			disabled={disabled || loading}
		>
			{$T('ship.addPriceMethod')}
		</Button>
	</SectionHeader>

	<Table columns={PriceBasedColumns} items={PriceBasedMethods} disabled={disabled || loading} />

	<SectionHeader>
		<div>{$T('ship.weightMethods')}</div>
		<Button
			endIcon={Plus}
			variant="light"
			size="xs"
			href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW(
				page.params.id!,
				ShippingMethodTypeEnum.Weight,
			)}
			disabled={disabled || loading}
		>
			{$T('ship.addWeightMethod')}
		</Button>
	</SectionHeader>

	<Table columns={WeightBasedColumns} items={WeightBasedMethods} disabled={disabled || loading} />
</div>
