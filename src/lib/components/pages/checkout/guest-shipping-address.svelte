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
		QueryChannelArgs,
	} from '$lib/gql/graphql';
	import { CHANNEL_DETAILS_QUERY_STORE } from '$lib/api/channels';
	import {
		CHECKOUT_BILLING_ADDRESS_UPDATE_MUTATION,
		CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION,
	} from '$lib/api/checkout';
	import { operationStore } from '$lib/api/operation';
	import { getCountryName } from '$lib/utils/address';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import AddressForm from './address-form.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	let updatingCHeckoutAddresses = $state(false);
	let showAddressEdit = $state(false);

	const channelStore = operationStore<Pick<Query, 'channel'>, QueryChannelArgs>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: {
			slug: checkout.channel.slug,
		},
		context: { requestPolicy: 'cache-and-network' },
		// pause if no channel or checkout already has shipping address
		pause: !checkout.channel.slug || !!checkout.shippingAddress,
	});

	const handleAttachAddressToCheckout = async (
		addressInput: AddressInput,
		type?: AddressTypeEnum,
	) => {
		const validationRules: CheckoutAddressValidationRules = {
			checkFieldsFormat: true,
			checkRequiredFields: true,
			enableFieldsNormalization: true,
		};

		const updateShippingAddressMutation = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutShippingAddressUpdate'>,
			MutationCheckoutShippingAddressUpdateArgs
		>(CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION, {
			shippingAddress: addressInput,
			id: checkout.id,
			validationRules,
		});

		const updateBillingAddressMutation = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutBillingAddressUpdate'>,
			MutationCheckoutBillingAddressUpdateArgs
		>(CHECKOUT_BILLING_ADDRESS_UPDATE_MUTATION, {
			billingAddress: addressInput,
			id: checkout.id,
			validationRules,
		});

		updatingCHeckoutAddresses = true; //
		const updateResult = await Promise.all([
			updateShippingAddressMutation,
			updateBillingAddressMutation,
		]);
		updatingCHeckoutAddresses = false; //

		if (
			checkIfGraphqlResultHasError(
				updateResult[0],
				'checkoutShippingAddressUpdate',
				'Shipping address updated',
			) ||
			checkIfGraphqlResultHasError(
				updateResult[1],
				'checkoutBillingAddressUpdate',
				'Billing address updated',
			)
		)
			return;

		showAddressEdit = false;
		scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleClickEditAddress = () => {
		if (checkout.channel.slug) {
			channelStore.resume();
			showAddressEdit = true;
		}
	};

	const handleCancelEditAddress = () => {
		scrollTo({ top: 0, behavior: 'smooth' });
		showAddressEdit = false;
	};
</script>

{#if checkout.shippingAddress && !showAddressEdit}
	<UserAddress address={checkout.shippingAddress}>
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
			label: getCountryName(code),
		})) || []}
	<AddressForm
		{updatingCHeckoutAddresses}
		{countrySelectOptions}
		channelSlug={checkout.channel.slug!}
		onSubmit={handleAttachAddressToCheckout}
		defaultValue={checkout.shippingAddress as Address}
		onCancel={handleCancelEditAddress}
	/>
{/if}
