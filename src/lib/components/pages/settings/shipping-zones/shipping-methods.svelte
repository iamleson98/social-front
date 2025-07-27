<script lang="ts">
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { DELETE_SHIPPING_METHOD_MUTATION } from '$lib/api/admin/shipping';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import WeightDisplay from '$lib/components/common/weight-display.svelte';
	import { Edit, Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		ShippingMethodTypeEnum,
		type Mutation,
		type MutationShippingPriceDeleteArgs,
		type ShippingMethodType,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import {
		checkIfGraphqlResultHasError,
		classNames,
		SitenameCommonClassName,
	} from '$lib/utils/utils';

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

	const WeightBasedColumns: TableColumnProps<ShippingMethodType>[] = [
		{
			title: 'name',
			child: name,
		},
		{
			title: 'weight range',
			child: weightRange,
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

	const handleDeleteMethod = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('common.confirmDel'),
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'shippingPriceDelete'>,
					MutationShippingPriceDeleteArgs
				>(DELETE_SHIPPING_METHOD_MUTATION, { id });

				loading = false;

				if (
					checkIfGraphqlResultHasError(
						result,
						'shippingPriceDelete',
						$tranFunc('common.delSuccess'),
					)
				)
					return;

				onDoneUpdate?.();
			},
		});
	};
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
		{disabled}
	/>
{/snippet}

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Price based methods</div>

		<Button
			endIcon={Plus}
			variant="light"
			size="xs"
			href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW(page.params.id, 'price')}
			{disabled}
		>
			Create price based method
		</Button>
	</SectionHeader>

	<Table columns={PriceBasedColumns} items={PriceBasedMethods} {disabled} />

	<SectionHeader>
		<div>Weight based methods</div>
		<Button
			endIcon={Plus}
			variant="light"
			size="xs"
			href={AppRoute.SETTINGS_CONFIGS_SHIPPING_ZONE_METHOD_NEW(page.params.id, 'weight')}
			{disabled}
		>
			Create weight based method
		</Button>
	</SectionHeader>

	<Table columns={WeightBasedColumns} items={WeightBasedMethods} {disabled} />
</div>
