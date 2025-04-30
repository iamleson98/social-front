<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Button } from '$lib/components/ui';
	import { tranFunc } from '$i18n';
	import { Select } from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, number, object, string, z } from 'zod';
	import slugify from 'slugify';
	import { CHANNEL_CREATE_MUTATION } from '$lib/api/admin/channels';
	import {
		CountryCode,
		MarkAsPaidStrategyEnum,
		TransactionFlowStrategyEnum,
		type ChannelCreateInput,
		type Mutation,
		type MutationChannelCreateArgs
	} from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { getCountryName } from '$lib/utils/address';
	import { CHANNELS } from '$lib/utils/channels';
	import { goto } from '$app/navigation';
	import { AppRoute } from '$lib/utils';
	import ShippingZonesForm from '$lib/components/pages/settings/config/channel/shipping-zones-form.svelte';
	import WarehousesForm from '$lib/components/pages/settings/config/channel/warehouses-form.svelte';

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const channelSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
		currencyCode: string(),
		defaultCountry: string().nonempty(REQUIRED_ERROR),
		orderSettings: object({
			deleteExpiredOrdersAfter: number().min(1, 'Must be >= 1').max(120, 'Must be <= 120')
		})
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});
	let loading = $state(false);

	let addShippingZones = $state<string[]>([]);
	let removeShippingZones = $state<string[]>([]);
	let addWarehouses = $state<string[]>([]);
	let removeWarehouses = $state<string[]>([]);

	const countryOptions = Object.values(CountryCode).map((code) => ({
		value: code,
		label: getCountryName(code)
	}));

	const currencyOptions = Array.from(new Set(CHANNELS.map((chan) => chan.currency))).map(
		(code) => ({
			value: code,
			label: code
		})
	);

	let channelValues = $state<ChannelCreateInput>({
		name: '',
		slug: '',
		isActive: false,
		currencyCode: '',
		defaultCountry: '' as CountryCode,
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

	const validate = () => {
		const parseResult = channelSchema.safeParse(channelValues);
		if (!parseResult.success) {
			channelFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		channelFormErrors = {};
		return true;
	};

	const handleFormChange = (field: keyof ChannelCreateInput) => {
		if (field === 'name' && typeof channelValues.name === 'string') {
			channelValues.slug = slugify(channelValues.name, { lower: true });
		}
		validate();
	};

	const handleAddChannel = async () => {
		if (!validate()) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelCreate'>,
			MutationChannelCreateArgs
		>(CHANNEL_CREATE_MUTATION, {
			input: {
				...channelValues,
				defaultCountry: channelValues.defaultCountry as CountryCode,
				addShippingZones,
				addWarehouses
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelCreate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel created successfully'
		});

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
	};
</script>

<div class="h-full">
	<div class="flex flex-row gap-2">
		<!-- MARK: general information -->
		<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
			<div class="flex gap-2 items-start">
				<Input
					label="Name"
					bind:value={channelValues.name}
					variant={channelFormErrors?.name?.length ? 'error' : 'info'}
					subText={channelFormErrors?.name?.length ? channelFormErrors.name[0] : ''}
					required
					disabled={loading}
					class="flex-1"
					inputDebounceOption={{ onInput: () => handleFormChange('name') }}
				/>
				<Input
					label="Slug"
					bind:value={channelValues.slug}
					class="flex-1"
					required
					variant={channelFormErrors?.slug?.length ? 'error' : 'info'}
					subText={channelFormErrors?.slug?.length ? channelFormErrors.slug[0] : ''}
					disabled={loading}
					inputDebounceOption={{ onInput: () => handleFormChange('slug') }}
				/>
			</div>

			<div class="mt-3 flex gap-3 items-center">
				<Input
					label="Order expiration"
					bind:value={channelValues.orderSettings!.deleteExpiredOrdersAfter}
					inputDebounceOption={{ onInput: () => handleFormChange('orderSettings') }}
					disabled={loading}
					class="flex-1"
					type="number"
					min={1}
					max={120}
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
				<Select
					label="Currency"
					options={currencyOptions}
					class="flex-1"
					required
					variant={channelFormErrors?.currencyCode?.length ? 'error' : 'info'}
					subText={channelFormErrors?.currencyCode?.length ? channelFormErrors.currencyCode[0] : ''}
					bind:value={channelValues.currencyCode}
				/>
				<Select
					label="Country"
					options={countryOptions}
					placeholder="Select a country"
					class="flex-1"
					bind:value={channelValues.defaultCountry as CountryCode}
					required
					variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
					subText={channelFormErrors?.defaultCountry?.length
						? channelFormErrors.defaultCountry[0]
						: ''}
					disabled={loading}
				/>
			</div>

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
			<!-- <NewChannelShippingZones
				channelSlug={"channelValues.slug"}
				bind:addShippingZones
				bind:removeShippingZones
				disabled={loading}
			/>
			<NewChannelWarehouses
				channelSlug={channelValues.slug}
				bind:addWarehouses
				bind:removeWarehouses
				disabled={loading}
			/> -->

			<ShippingZonesForm
				bind:addShippingZones={addShippingZones}
				disabled={loading}
			/>
			<WarehousesForm
				bind:addWarehouses={addWarehouses}
				disabled={loading}
			/>
		</div>
	</div>

	<!-- MARK: channel detail actions -->
	<div
		class="mt-5 sticky bottom-0 flex justify-between gap-3 items-center bg-white p-2 border rounded-lg border-gray-200"
	>
	<div class="w-full"></div>
		<Button
			variant="light"
			color="gray"
			disabled={loading}
			href={AppRoute.SETTINGS_CONFIGS_CHANNELS()}>Back</Button
		>
		<Button disabled={loading} onclick={handleAddChannel}>Create</Button>
	</div>
</div>
