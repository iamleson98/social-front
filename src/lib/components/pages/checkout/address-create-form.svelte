<script lang="ts">
	import { T } from '$i18n';
	import { CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import type {
		AddressInput,
		Checkout,
		Mutation,
		MutationCheckoutShippingAddressUpdateArgs,
	} from '$lib/gql/graphql';
	import { checkoutStore } from '$lib/stores/app';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import AddressForm from './address-form.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		onCancel: () => void;
		checkout: Checkout;
	}

	const { onCancel, checkout }: Props = $props();

	let saving = $state(false);

	/** save the newly entered address on the checkout and close the form */
	const handleSubmit = async (address: AddressInput): Promise<void> => {
		if (saving) {
			return;
		}
		saving = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutShippingAddressUpdate'>,
			MutationCheckoutShippingAddressUpdateArgs
		>(CHECKOUT_SHIPPING_ADDRESS_UPDATE_MUTATION, {
			id: checkout.id,
			shippingAddress: address,
		});

		saving = false;

		if (checkIfGraphqlResultHasError(result, 'checkoutShippingAddressUpdate')) {
			return;
		}

		const updatedCheckout = result.data?.checkoutShippingAddressUpdate?.checkout;
		if (updatedCheckout) {
			checkoutStore.set(updatedCheckout);
		}
		toast.success($T('settings.addrCreated'));
		onCancel();
	};
</script>

<div>
	<AddressForm
		channelSlug={checkout.channel.slug}
		updatingCheckoutAddresses={false}
		onSubmit={handleSubmit}
		{onCancel}
	/>
	<Button size="xs" color="red" variant="light" class="mt-2" onclick={onCancel}>
		{$T('common.cancel')}
	</Button>
</div>
