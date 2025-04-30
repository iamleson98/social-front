<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNEL_DETAILS_QUERY_STORE, CHANNELS_QUERY } from '$lib/api/channels';
	import {
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type Channel,
		type ChannelUpdateInput,
		type CountryCode,
		type Mutation,
		type MutationChannelDeleteArgs,
		type MutationChannelUpdateArgs,
		type Query
	} from '$lib/gql/graphql';
	import { Input } from '$lib/components/ui/Input';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { afterNavigate, goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { Modal } from '$lib/components/ui/Modal';
	import { tranFunc } from '$i18n';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, number, object, string, z } from 'zod';
	import { onMount } from 'svelte';
	import slugify from 'slugify';
	import ChannelDetailSkeleton from '$lib/components/pages/settings/config/channel-detail-skeleton.svelte';
	import ChannelShippingZones from '$lib/components/pages/settings/config/channel/channel-shipping-zones.svelte';
	import ChannelWarehouses from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';
	import { isEqual, omit } from 'es-toolkit';

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: { slug: page.params.slug },
		requestPolicy: 'network-only'
	});

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'network-only',
		query: CHANNELS_QUERY,
		pause: true
	});

	let channelToReplaceId = $state<string>();
	let loading = $state(false);
	let openDeleteModal = $state(false);
	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const channelSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
		defaultCountry: string()
			.nonempty(REQUIRED_ERROR)
			.optional()
			.refine((val) => val !== undefined, REQUIRED_ERROR),
		orderSettings: object({
			deleteExpiredOrdersAfter: number().min(1, 'Must be >= 1').max(120, 'Must be <= 120')
		})
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});

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
			automaticallyCompleteFullyPaidCheckouts: false
		},
		orderSettings: {
			allowUnpaidOrders: false,
			deleteExpiredOrdersAfter: 60,
			markAsPaidStrategy: MarkAsPaidStrategyEnum.PaymentFlow
		},
		paymentSettings: {
			defaultTransactionFlowStrategy: TransactionFlowStrategyEnum.Charge
		}
	});
	/** the existing channel props, used for keeping track of changes */
	let oldChannel = $state<Channel>();

	onMount(() => {
		const unsub = channelDetailQuery.subscribe((result) => {
			if (result.data?.channel) {
				oldChannel = result.data.channel; // assign old channel values right when fetching success

				channelValues = {
					...channelValues,
					name: oldChannel.name,
					slug: oldChannel.slug,
					isActive: oldChannel.isActive,
					defaultCountry: oldChannel?.defaultCountry?.code as CountryCode,
					currencyCode: oldChannel.currencyCode,
					orderSettings: { ...oldChannel.orderSettings },
					checkoutSettings: { ...oldChannel.checkoutSettings },
					paymentSettings: { ...oldChannel.paymentSettings }
				};
			}
		});

		return unsub;
	});

	$effect(() => {
		if (openDeleteModal) channelsQuery.resume();
	});

	let nothingChanged = $derived.by(() => {
		if (!oldChannel) return true;

		const shippingZonesNotChanged =
			!channelValues.addShippingZones?.length && !channelValues.removeShippingZones?.length;
		const warehousesNotChanged =
			!channelValues.addWarehouses?.length && !channelValues.removeWarehouses?.length;

		return (
			channelValues.name === oldChannel.name &&
			channelValues.slug === oldChannel.slug &&
			channelValues.isActive === oldChannel.isActive &&
			channelValues.defaultCountry === oldChannel.defaultCountry?.code &&
			shippingZonesNotChanged &&
			warehousesNotChanged &&
			channelValues.orderSettings?.markAsPaidStrategy ===
				oldChannel.orderSettings.markAsPaidStrategy &&
			channelValues.orderSettings?.allowUnpaidOrders ===
				oldChannel.orderSettings.allowUnpaidOrders &&
			channelValues.orderSettings?.deleteExpiredOrdersAfter ===
				oldChannel.orderSettings.deleteExpiredOrdersAfter &&
			channelValues.checkoutSettings?.automaticallyCompleteFullyPaidCheckouts ===
				oldChannel.checkoutSettings.automaticallyCompleteFullyPaidCheckouts &&
			channelValues.paymentSettings?.defaultTransactionFlowStrategy ===
				oldChannel.paymentSettings.defaultTransactionFlowStrategy
		);
	});

	const validate = () => {
		const parseResult = channelSchema.safeParse(channelValues);
		if (!parseResult.success) {
			channelFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		channelFormErrors = {};
		return true;
	};

	$inspect(channelValues, oldChannel);

	const delModalHeader = $derived(
		$tranFunc('settings.confirmDelChannel', { id: channelValues.name })
	);

	const handleFormChange = (field: keyof ChannelSchema) => {
		if (field === 'name' && typeof channelValues.name === 'string') {
			channelValues.slug = slugify(channelValues.name, { lower: true });
		}
		validate();
	};

	const handleDeleteChannel = async () => {
		const variable: MutationChannelDeleteArgs = {
			id: $channelDetailQuery.data?.channel?.id as string
		};
		if (channelToReplaceId) {
			variable.input = {
				channelId: channelToReplaceId
			};
		}

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelDelete'>>(
			CHANNEL_DELETE_MUTATION,
			variable
		);

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelDelete')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel deleted successfully'
		});
		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
	};

	const handleUpdateChannel = async () => {
		if (!validate()) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelUpdate'>,
			MutationChannelUpdateArgs
		>(CHANNEL_UPDATE_MUTATION, {
			id: $channelDetailQuery.data?.channel?.id as string,
			input: omit(channelValues, ['currencyCode'])
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelUpdate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel updated successfully'
		});

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(channelValues.slug as string), {
			replaceState: true
		});
	};

	afterNavigate(() => {
		const slug = page.params.slug;
		channelDetailQuery.reexecute({ variables: { slug } });
	});
</script>

{#if $channelDetailQuery.fetching}
	<ChannelDetailSkeleton />
{:else if $channelDetailQuery.error}
	<Alert variant="error" bordered>{$channelDetailQuery.error.message}</Alert>
{:else if $channelDetailQuery.data?.channel}
	{@const { channel } = $channelDetailQuery.data}
	{@const countryOptions =
		channel.countries?.map<SelectOption>((country) => ({
			value: country.code,
			label: country.country
		})) || []}
	{@const replaceChannelOptions =
		$channelsQuery.data?.channels?.reduce<SelectOption[]>((acc, cur) => {
			if (cur.id !== channel.id && cur.currencyCode === channel.currencyCode) {
				return acc.concat({
					value: cur.id,
					label: cur.name
				});
			}
			return acc;
		}, []) || []}
	<div class="h-full">
		<div class="flex flex-row gap-2">
			<!-- MARK: general information -->
			<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
				<div class="flex gap-2 items-start">
					<Input
						label="Name"
						bind:value={channelValues.name}
						inputDebounceOption={{ onInput: () => handleFormChange('name') }}
						variant={channelFormErrors?.name?.length ? 'error' : 'info'}
						subText={channelFormErrors?.name?.length ? channelFormErrors.name[0] : ''}
						required
						disabled={loading}
						class="flex-1"
					/>
					<Input
						label="Slug"
						bind:value={channelValues.slug}
						class="flex-1"
						required
						variant={channelFormErrors?.slug?.length ? 'error' : 'info'}
						subText={channelFormErrors?.slug?.length ? channelFormErrors.slug[0] : ''}
						inputDebounceOption={{ onInput: () => handleFormChange('slug') }}
						disabled={loading}
					/>
				</div>

				<div class="mt-3 flex gap-3 items-center">
					<Input
						label="Order expiration"
						bind:value={channelValues.orderSettings!.deleteExpiredOrdersAfter}
						disabled={loading}
						class="flex-1"
						type="number"
						min={1}
						max={120}
						inputDebounceOption={{ onInput: () => handleFormChange('orderSettings') }}
						variant={channelFormErrors?.orderSettings?.length ? 'error' : 'info'}
						subText={channelFormErrors?.orderSettings?.length
							? channelFormErrors.orderSettings[0]
							: 'The time in days after expired orders will be deleted. Allowed range between 1 and 120.'}
					/>
					<Checkbox
						label={channelValues.isActive ? 'Active' : 'Inactive'}
						bind:checked={channelValues.isActive}
						disabled={loading}
						size="sm"
						class="flex-1"
					/>
				</div>

				<div class="mt-3 flex gap-3">
					<Input label="Currency" value={channelValues.currencyCode} disabled class="flex-1" />
					<Select
						label="Country"
						options={countryOptions}
						placeholder="Select a country"
						class="flex-1"
						bind:value={channelValues.defaultCountry as string}
						required
						variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
						subText={channelFormErrors?.defaultCountry?.length
							? channelFormErrors.defaultCountry[0]
							: ''}
						onchange={() => handleFormChange('defaultCountry')}
						disabled={loading}
					/>
				</div>
				<Modal
					open={openDeleteModal}
					header={delModalHeader}
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
						label="Please specify channel to replace"
						placeholder="Channel to replace"
					/>

					<Alert variant="info" size="sm" bordered class="mt-3">
						Specify a new channel to assign products to. The replace channel must have the same
						currency as deleting channel
					</Alert>
				</Modal>

				<div class="mt-3 flex flex-col gap-1">
					<Checkbox
						label="Allow unpaid orders"
						bind:checked={channelValues.orderSettings!.allowUnpaidOrders}
						disabled={loading}
						size="sm"
						subText={`Enables completing checkout with order before a successful payment. <div class="badge badge-outline badge-xs badge-warning">Preview</div>`}
						class="mb-3"
					/>
					<Checkbox
						label="Use Transaction flow when marking order as paid"
						disabled={loading}
						size="sm"
						class="mb-3"
						checked={channelValues.orderSettings!.markAsPaidStrategy ===
							MarkAsPaidStrategyEnum.TransactionFlow}
						onchange={(evt) => {
							channelValues.orderSettings!.markAsPaidStrategy = evt.currentTarget.checked
								? MarkAsPaidStrategyEnum.TransactionFlow
								: MarkAsPaidStrategyEnum.PaymentFlow;
						}}
						subText={`"Mark as paid" feature creates a Transaction - used by Payment Apps. <br /> If left unchecked it creates a Payment - used by Payment Plugins. <div class="badge badge-outline badge-xs badge-warning">Preview</div>`}
					/>
					<Checkbox
						label="Automatically complete checkouts when fully paid"
						bind:checked={channelValues.checkoutSettings!.automaticallyCompleteFullyPaidCheckouts}
						disabled={loading}
						size="sm"
						class="mb-3"
						subText="When enabled, checkouts detected as fully paid will be completed automatically, without checkoutComplete mutation."
					/>
					<Checkbox
						label="Authorize transaction instead of charging"
						checked={channelValues.paymentSettings!.defaultTransactionFlowStrategy ===
							TransactionFlowStrategyEnum.Authorization}
						onchange={(evt) => {
							channelValues.paymentSettings!.defaultTransactionFlowStrategy = evt.currentTarget
								.checked
								? TransactionFlowStrategyEnum.Authorization
								: TransactionFlowStrategyEnum.Charge;
						}}
						disabled={loading}
						size="sm"
						subText={`When enabled, all transactions would require an additional step to be charged. <div class="badge badge-outline badge-xs badge-warning">Preview</div>`}
					/>
				</div>
			</div>

			<!-- MARK: channel detail sidebar -->
			<div class="w-1/3">
				<ChannelShippingZones
					channelSlug={channel.slug}
					bind:addShippingZones={channelValues.addShippingZones as string[]}
					bind:removeShippingZones={channelValues.removeShippingZones as string[]}
					disabled={loading}
				/>
				<ChannelWarehouses
					channelSlug={channel.slug}
					bind:addWarehouses={channelValues.addWarehouses as string[]}
					bind:removeWarehouses={channelValues.removeWarehouses as string[]}
					disabled={loading}
				/>
			</div>
		</div>

		<!-- MARK: channel detail actions -->
		<div
			class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
		>
			<Button color="red" disabled={loading} onclick={() => (openDeleteModal = true)}>Delete</Button
			>

			<div class="flex gap-2">
				<Button
					variant="light"
					color="gray"
					disabled={loading}
					href={AppRoute.SETTINGS_CONFIGS_CHANNELS()}>Back</Button
				>
				<Button disabled={loading || nothingChanged} onclick={handleUpdateChannel}>Update</Button>
			</div>
		</div>
	</div>
{/if}
