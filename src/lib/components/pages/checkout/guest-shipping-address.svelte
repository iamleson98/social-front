<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Edit } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { type SelectOption } from '$lib/components/ui/select';
	import type {
		Address,
		AddressInput,
		AddressTypeEnum,
		Checkout,
		CheckoutAddressValidationRules,
		Mutation,
		MutationCheckoutBillingAddressUpdateArgs,
		MutationCheckoutShippingAddressUpdateArgs,
		Query,
		QueryChannelArgs
	} from '$lib/gql/graphql';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import {
		CHECKOUT_BILLING_ADDRESS_UPDATE_MUTATION,
		CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION
	} from '$lib/api/checkout';
	import { operationStore } from '$lib/api/operation';
	import { checkoutStore } from '$lib/stores/app';
	import { toastStore } from '$lib/stores/ui/toast';
	import { getCountryName } from '$lib/utils/address';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import AddressForm from './address-form.svelte';

	let updatingCHeckoutAddresses = $state(false);
	let showAddressEdit = $state(false);
	let currentAddress = $derived($checkoutStore?.shippingAddress);

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: $checkoutStore?.channel.slug
		},
		context: { requestPolicy: 'cache-and-network' },
		// pause if no channel or $checkoutStore? already has shipping address
		pause: !$checkoutStore?.channel.slug || !!$checkoutStore?.shippingAddress
	});

	const handleAttachAddressToCheckout = async (addressInput: AddressInput, type?: AddressTypeEnum) => {
		const validationRules: CheckoutAddressValidationRules = {
			checkFieldsFormat: true,
			checkRequiredFields: true,
			enableFieldsNormalization: true
		};

		const updateShippingAddressMutation = GRAPHQL_CLIENT
			.mutation<
				Pick<Mutation, 'checkoutShippingAddressUpdate'>,
				MutationCheckoutShippingAddressUpdateArgs
			>(CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION, {
				shippingAddress: addressInput,
				id: $checkoutStore?.id,
				validationRules
			})
			.toPromise();

		const updateBillingAddressMutation = GRAPHQL_CLIENT
			.mutation<
				Pick<Mutation, 'checkoutBillingAddressUpdate'>,
				MutationCheckoutBillingAddressUpdateArgs
			>(CHECKOUT_BILLING_ADDRESS_UPDATE_MUTATION, {
				billingAddress: addressInput,
				id: $checkoutStore?.id,
				validationRules
			})
			.toPromise();

		updatingCHeckoutAddresses = true; //
		const updateResult = await Promise.all([
			updateShippingAddressMutation,
			updateBillingAddressMutation
		]);
		updatingCHeckoutAddresses = false; //

		if (preHandleErrorOnGraphqlResult(updateResult[0]) || preHandleErrorOnGraphqlResult(updateResult[1])) return;

		const shippingAddressData = updateResult[0].data?.checkoutShippingAddressUpdate;
		const billingAddressData = updateResult[1].data?.checkoutBillingAddressUpdate;

		if (shippingAddressData?.errors.length || billingAddressData?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: (shippingAddressData?.errors[0].message ||
					billingAddressData?.errors[0].message) as string
			});
			return;
		}

		checkoutStore.set(shippingAddressData?.checkout as Checkout);
		showAddressEdit = false;
		scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleClickEditAddress = () => {
		if ($checkoutStore?.channel.slug) {
			channelStore.resume();
			showAddressEdit = true;
		}
	};

	const handleCancelEditAddress = () => {
		scrollTo({ top: 0, behavior: 'smooth' });
		showAddressEdit = false;
	};
</script>

{#if currentAddress && !showAddressEdit}
	<UserAddress address={currentAddress}>
		<div class="text-right">
			<Button size="xs" startIcon={Edit} variant="light" onclick={handleClickEditAddress}
				>Edit</Button
			>
		</div>
	</UserAddress>
{:else if $channelStore.fetching}
	<div>Loading...</div>
{:else if $channelStore.error}
	<div>{$channelStore.error.message}</div>
{:else}
	{@const countrySelectOptions =
		$channelStore.data?.channel?.countries?.map<SelectOption>(({ code }) => ({
			value: code,
			label: getCountryName(code)
		})) || []}
	<AddressForm
		{updatingCHeckoutAddresses}
		{countrySelectOptions}
		channelSlug={$checkoutStore?.channel.slug!}
		onSubmit={handleAttachAddressToCheckout}
		defaultValue={currentAddress as Address}
		onCancel={handleCancelEditAddress}
	/>
{/if}
