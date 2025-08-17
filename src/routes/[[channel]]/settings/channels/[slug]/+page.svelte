<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNEL_DETAILS_QUERY, CHANNELS_QUERY } from '$lib/api/channels';
	import {
		AllocationStrategyEnum,
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type Channel,
		type ChannelUpdateInput,
		type CountryCode,
		type Mutation,
		type MutationChannelDeleteArgs,
		type MutationChannelUpdateArgs,
		type Query,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { afterNavigate, goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { Modal } from '$lib/components/ui/Modal';
	import { tranFunc } from '$i18n';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Alert } from '$lib/components/ui/Alert';
	import { onMount } from 'svelte';
	import ChannelDetailSkeleton from '$lib/components/pages/settings/channel/channel-detail-skeleton.svelte';
	import { omit } from 'es-toolkit';
	import ShippingZonesForm from '$lib/components/pages/settings/channel/shipping-zones-form.svelte';
	import WarehousesForm from '$lib/components/pages/settings/channel/warehouses-form.svelte';
	import ChannelForm from '$lib/components/pages/settings/channel/channel-form.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		query: CHANNEL_DETAILS_QUERY,
		variables: { slug: page.params.slug },
		requestPolicy: 'network-only',
	});

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY,
		pause: true,
	});

	let channelToReplaceId = $state<string>();
	let loading = $state(false);
	let openDeleteModal = $state(false);
	let formOk = $state(false);

	let channelValues = $state<ChannelUpdateInput & { currencyCode: string }>({
		name: '',
		slug: '',
		isActive: false,
		defaultCountry: undefined,
		addShippingZones: [],
		removeShippingZones: [],
		addWarehouses: [],
		removeWarehouses: [],
		currencyCode: '',
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
	/** the existing channel props, used for keeping track of changes */
	let oldChannel = $state.raw<Channel>();

	onMount(() => {
		return channelDetailQuery.subscribe((result) => {
			if (result.data?.channel) {
				oldChannel = result.data.channel; // assign old channel values right when fetching success

				channelValues = {
					...channelValues,
					name: oldChannel.name,
					slug: oldChannel.slug,
					isActive: oldChannel.isActive,
					defaultCountry: oldChannel?.defaultCountry?.code as CountryCode,
					currencyCode: oldChannel.currencyCode,
					orderSettings: omit(oldChannel.orderSettings, ['__typename']),
					checkoutSettings: omit(oldChannel.checkoutSettings, ['__typename']),
					paymentSettings: omit(oldChannel.paymentSettings, ['__typename']),
					stockSettings: omit(oldChannel.stockSettings, ['__typename']),
				};
			}
		});
	});

	$effect(() => {
		if (openDeleteModal) channelsQuery.resume();
	});

	let nothingChanged = $derived.by(() => {
		if (!oldChannel) return true;

		return (
			channelValues.name === oldChannel.name &&
			channelValues.slug === oldChannel.slug &&
			channelValues.isActive === oldChannel.isActive &&
			channelValues.defaultCountry === oldChannel.defaultCountry?.code &&
			!channelValues.addShippingZones?.length &&
			!channelValues.removeShippingZones?.length &&
			!channelValues.addWarehouses?.length &&
			!channelValues.removeWarehouses?.length &&
			channelValues.orderSettings?.markAsPaidStrategy ===
				oldChannel.orderSettings.markAsPaidStrategy &&
			channelValues.orderSettings?.allowUnpaidOrders ===
				oldChannel.orderSettings.allowUnpaidOrders &&
			channelValues.orderSettings?.deleteExpiredOrdersAfter ===
				oldChannel.orderSettings.deleteExpiredOrdersAfter &&
			channelValues.checkoutSettings?.automaticallyCompleteFullyPaidCheckouts ===
				oldChannel.checkoutSettings.automaticallyCompleteFullyPaidCheckouts &&
			channelValues.paymentSettings?.defaultTransactionFlowStrategy ===
				oldChannel.paymentSettings.defaultTransactionFlowStrategy &&
			channelValues.stockSettings?.allocationStrategy ===
				oldChannel.stockSettings?.allocationStrategy
		);
	});

	const handleDeleteChannel = async () => {
		const variable: MutationChannelDeleteArgs = {
			id: $channelDetailQuery.data?.channel?.id as string,
		};
		if (channelToReplaceId) {
			variable.input = {
				channelId: channelToReplaceId,
			};
		}

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelDelete'>,
			MutationChannelDeleteArgs
		>(CHANNEL_DELETE_MUTATION, variable);

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'channelDelete', $tranFunc('channel.delSuccess')))
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
	};

	const handleUpdateChannel = async () => {
		if (!formOk) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelUpdate'>,
			MutationChannelUpdateArgs
		>(CHANNEL_UPDATE_MUTATION, {
			id: $channelDetailQuery.data?.channel?.id as string,
			input: omit(channelValues, ['currencyCode']),
		});

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'channelUpdate', $tranFunc('channel.editSuccess')))
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(channelValues.slug as string), {
			replaceState: true,
			invalidateAll: true,
		});
	};

	afterNavigate(() => {
		const { slug } = page.params;
		channelDetailQuery.reexecute({ variables: { slug } });
	});
</script>

{#if $channelDetailQuery.fetching}
	<ChannelDetailSkeleton />
{:else if $channelDetailQuery.error}
	<Alert variant="error" bordered>{$channelDetailQuery.error.message}</Alert>
{:else if $channelDetailQuery.data?.channel}
	{@const { channel } = $channelDetailQuery.data}
	{@const replaceChannelOptions =
		$channelsQuery.data?.channels?.reduce<SelectOption[]>((acc, cur) => {
			if (cur.id !== channel.id && cur.currencyCode === channel.currencyCode) {
				return acc.concat({
					value: cur.id,
					label: cur.name,
				});
			}
			return acc;
		}, []) || []}
	<div class="h-full">
		<div class="flex flex-row gap-2">
			<!-- MARK: general information -->

			<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
				<ChannelForm
					bind:name={channelValues.name as string}
					bind:slug={channelValues.slug as string}
					bind:defaultCountry={channelValues.defaultCountry as CountryCode}
					bind:isActive={channelValues.isActive as boolean}
					bind:currencyCode={channelValues.currencyCode}
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
				/>
			</div>

			<!-- MARK: channel detail sidebar -->
			<div class="w-1/3">
				<ShippingZonesForm
					channelSlug={channel.slug}
					bind:addShippingZones={channelValues.addShippingZones as string[]}
					bind:removeShippingZones={channelValues.removeShippingZones as string[]}
					disabled={loading}
				/>

				<WarehousesForm
					channelSlug={channel.slug}
					bind:addWarehouses={channelValues.addWarehouses as string[]}
					bind:removeWarehouses={channelValues.removeWarehouses as string[]}
					disabled={loading}
				/>
			</div>
		</div>

		<!-- MARK: channel detail actions -->
		<ActionBar
			onUpdateClick={handleUpdateChannel}
			disableUpdateButton={nothingChanged || loading || !formOk}
			onDeleteClick={() => (openDeleteModal = true)}
			disableDeleteButton={loading}
			backButtonUrl={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
			disableBackButton={loading}
		/>
	</div>

	<Modal
		open={openDeleteModal}
		header={$tranFunc('channel.confirmDelChannel', { id: channelValues.name })}
		onOk={handleDeleteChannel}
		onCancel={() => (openDeleteModal = false)}
		onClose={() => (openDeleteModal = false)}
		closeOnOutsideClick
		size="sm"
		cancelText={$tranFunc('common.cancel')}
		okText={$tranFunc('btn.delete')}
	>
		<Select
			options={replaceChannelOptions}
			bind:value={channelToReplaceId}
			label={$tranFunc('channel.chanToReplace')}
			placeholder={$tranFunc('channel.chanToReplace')}
		/>

		<Alert variant="info" size="sm" bordered class="mt-3">
			{$tranFunc('channel.replaceChanHelpTxt')}
		</Alert>
	</Modal>
{/if}
