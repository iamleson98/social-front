<script lang="ts">
	import { CHANNEL_CREATE_MUTATION } from '$lib/api/admin/channels';
	import {
		AllocationStrategyEnum,
		CountryCode,
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type ChannelCreateInput,
		type Mutation,
		type MutationChannelCreateArgs,
	} from '$lib/gql/graphql';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { AppRoute } from '$lib/utils';
	import ShippingZonesForm from '$lib/components/pages/settings/channel/shipping-zones-form.svelte';
	import WarehousesForm from '$lib/components/pages/settings/channel/warehouses-form.svelte';
	import ChannelForm from '$lib/components/pages/settings/channel/channel-form.svelte';
	import { tranFunc } from '$i18n';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';

	let loading = $state(false);
	let formOk = $state(false);

	let channelValues = $state<ChannelCreateInput>({
		name: '',
		slug: '',
		isActive: false,
		currencyCode: '',
		defaultCountry: '' as CountryCode,
		addShippingZones: [],
		addWarehouses: [],
		checkoutSettings: {
			automaticallyCompleteFullyPaidCheckouts: false,
		},
		orderSettings: {
			allowUnpaidOrders: false,
			deleteExpiredOrdersAfter: 60,
			markAsPaidStrategy: MarkAsPaidStrategyEnum.PaymentFlow,
		},
		paymentSettings: {
			defaultTransactionFlowStrategy: TransactionFlowStrategyEnum.Charge,
		},
		stockSettings: {
			allocationStrategy: AllocationStrategyEnum.PrioritizeSortingOrder,
		},
	});

	const handleAddChannel = async () => {
		if (!formOk) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelCreate'>,
			MutationChannelCreateArgs
		>(CHANNEL_CREATE_MUTATION, {
			input: channelValues,
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'channelCreate', $tranFunc('channel.newSuccess')))
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
	};
</script>

<div class="h-full">
	<div class="flex flex-row gap-2">
		<!-- MARK: general information -->
		<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
			<ChannelForm
				bind:name={channelValues.name as string}
				bind:slug={channelValues.slug as string}
				bind:defaultCountry={channelValues.defaultCountry as CountryCode}
				bind:isActive={channelValues.isActive as boolean}
				bind:currencyCode={channelValues.currencyCode as string}
				bind:allowUnpaidOrders={channelValues.orderSettings!.allowUnpaidOrders as boolean}
				bind:deleteExpiredOrdersAfter={
					channelValues.orderSettings!.deleteExpiredOrdersAfter as number
				}
				bind:markAsPaidStrategy={
					channelValues.orderSettings!.markAsPaidStrategy as MarkAsPaidStrategyEnum
				}
				bind:automaticallyCompleteFullyPaidCheckouts={
					channelValues.checkoutSettings!.automaticallyCompleteFullyPaidCheckouts as boolean
				}
				bind:transactionFlowStrategy={
					channelValues.paymentSettings!
						.defaultTransactionFlowStrategy as TransactionFlowStrategyEnum
				}
				bind:allocationStrategy={channelValues.stockSettings!.allocationStrategy}
				bind:formOk
				disabled={loading}
				isCreatePage
			/>
		</div>

		<!-- MARK: channel detail sidebar -->
		<div class="w-1/3">
			<ShippingZonesForm
				bind:addShippingZones={channelValues.addShippingZones as string[]}
				disabled={loading}
			/>
			<WarehousesForm
				bind:addWarehouses={channelValues.addWarehouses as string[]}
				disabled={loading}
			/>
		</div>
	</div>

	<!-- MARK: channel detail actions -->
	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
		disableBackButton={loading}
		onAddClick={handleAddChannel}
		disableCreateButton={loading || !formOk}
	/>
</div>
