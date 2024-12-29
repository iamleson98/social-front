<script lang="ts">
	import Signin from '$lib/components/forms/signin.svelte';
	import { Email } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import { checkoutStore } from '$lib/stores/app';
	import { userStore } from '$lib/stores/auth';
	import DeliveryMethodForm from './delivery-method-form.svelte';
	import GuestShippingAddress from './guest-shipping-address.svelte';
	import PaymentForm from './payment-form.svelte';
	import UserShippingAddress from './user-shipping-address.svelte';

	let showLoginForm = $state(false);

	const toggleLogin = () => {
		showLoginForm = !showLoginForm;
	};
</script>

<div class="w-1/2 tablet:w-full">
	<div class="bg-white rounded-lg p-4 border">
		<div class="text-sm font-semibold mb-2 text-gray-800">Account</div>
		{#if $userStore}
			<div>{$userStore.email}</div>
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

	<div class="mt-2 bg-white p-4 rounded-lg border">
		<div class="text-sm font-semibold mb-2 text-gray-800">Delivery address</div>

		{#if $checkoutStore?.isShippingRequired}
			{#if $userStore}
				<UserShippingAddress />
			{:else}
				<GuestShippingAddress />
			{/if}
		{/if}
	</div>

	<DeliveryMethodForm />
	<PaymentForm />
</div>
