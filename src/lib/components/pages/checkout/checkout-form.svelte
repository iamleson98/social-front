<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Signin from '$lib/components/forms/signin.svelte';
	import { Email } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth/user';
	import DeliveryMethodForm from './delivery-method-form.svelte';
	import GuestShippingAddress from './guest-shipping-address.svelte';
	import PaymentForm from './payment-form.svelte';
	import UserShippingAddress from './user-shipping-address.svelte';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();

	let showLoginForm = $state(false);

	const toggleLogin = () => {
		showLoginForm = !showLoginForm;
	};
</script>

<div class="w-1/2 tablet:w-full flex flex-col gap-2">
	<div class="bg-white rounded-lg p-3 border border-gray-200">
		<SectionHeader>Account</SectionHeader>

		{#if $READ_ONLY_USER_STORE}
			<div>{$READ_ONLY_USER_STORE.email}</div>
		{:else}
			<div>
				{#if showLoginForm}
					<Signin onSuccess={toggleLogin} hideSocial />
				{:else}
					<div>
						<Input placeholder="Enter your email" startIcon={Email} />
					</div>
					<div class="text-right text-xs">
						Already have account ?
						<span
							tabindex="0"
							role="button"
							onkeydown={(evt) => evt.key === 'Enter' && toggleLogin()}
							class="text-blue-600 font-semibold hover:underline cursor-pointer"
							onclick={toggleLogin}>signin</span
						>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if checkout.isShippingRequired}
		<div class="mt-2 bg-white p-3 rounded-lg border border-gray-200">
			<SectionHeader>Delivery address</SectionHeader>

			{#if $READ_ONLY_USER_STORE}
				<UserShippingAddress {checkout} />
			{:else}
				<GuestShippingAddress />
			{/if}
		</div>

		<DeliveryMethodForm {checkout} />
	{/if}

	<PaymentForm {checkout} />
</div>
