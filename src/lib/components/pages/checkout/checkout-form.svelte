<script lang="ts">
	import { T } from '$i18n';
	import { CHECKOUT_EMAIL_UPDATE_MUTATION } from '$lib/api/checkout';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Email } from '$lib/components/icons';
	import Signin from '$lib/components/pages/auth/signin.svelte';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout, Mutation, MutationCheckoutEmailUpdateArgs } from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import DeliveryMethodForm from './delivery-method-form.svelte';
	import GuestShippingAddress from './guest-shipping-address.svelte';
	import PaymentForm from './payment-form.svelte';
	import UserShippingAddress from './user-shipping-address.svelte';

	interface Props {
		checkout: Checkout;
	}

	const { checkout }: Props = $props();

	let showLoginForm = $state(false);
	let guestEmail = $state('');
	let emailSaving = $state(false);
	let emailError = $state<string | undefined>();

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const toggleLogin = (): void => {
		showLoginForm = !showLoginForm;
	};

	/** persist the guest email on the checkout so `checkoutComplete` can create the order */
	const handleGuestEmailChange = async (): Promise<void> => {
		const email = guestEmail.trim();
		emailError = undefined;

		if (!email) {
			return;
		}
		if (!EMAIL_REGEX.test(email)) {
			emailError = $T('error.invalidEmail');
			return;
		}
		if (email === checkout.email) {
			return;
		}

		emailSaving = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'checkoutEmailUpdate'>,
			MutationCheckoutEmailUpdateArgs
		>(CHECKOUT_EMAIL_UPDATE_MUTATION, { id: checkout.id, email });

		emailSaving = false;

		if (checkIfGraphqlResultHasError(result, 'checkoutEmailUpdate')) {
			emailError =
				(result.data?.checkoutEmailUpdate?.errors?.[0]?.message || result.error?.message) ??
				'Invalid email';
			return;
		}
	};
</script>

<div class="w-1/2 max-tablet:w-full flex flex-col gap-2">
	<div class="bg-white rounded-lg p-3 border border-gray-200">
		<SectionHeader>{$T('checkout.account')}</SectionHeader>

		{#if $UserStoreManager}
			<div>{$UserStoreManager.email}</div>
		{:else}
			<div>
				{#if showLoginForm}
					<Signin onSuccess={toggleLogin} hideSocial />
				{:else}
					<div>
						<Input
							placeholder={$T('checkout.enterEmail')}
							startIcon={Email}
							type="email"
							bind:value={guestEmail}
							variant={emailError ? 'error' : 'info'}
							subText={emailError}
							onblur={handleGuestEmailChange}
							onkeydown={(evt) => evt.key === 'Enter' && handleGuestEmailChange()}
						/>
						{#if emailSaving}
							<div class="text-xs text-gray-400 mt-1">{$T('common.saving')}</div>
						{/if}
					</div>
					<div class="text-right text-xs">
						{$T('checkout.alreadyHasAccount')}
						<span
							tabindex="0"
							role="button"
							onkeydown={(evt) => evt.key === 'Enter' && toggleLogin()}
							class="text-blue-600 font-semibold hover:underline cursor-pointer"
							onclick={toggleLogin}>{$T('checkout.signin')}</span
						>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if checkout.isShippingRequired}
		<div class="mt-2 bg-white p-3 rounded-lg border border-gray-200">
			<SectionHeader>{$T('checkout.deliveryAddress')}</SectionHeader>

			{#if $UserStoreManager}
				<UserShippingAddress {checkout} />
			{:else}
				<GuestShippingAddress {checkout} />
			{/if}
		</div>

		<DeliveryMethodForm {checkout} />
	{/if}

	<PaymentForm {checkout} guestEmail={guestEmail.trim()} />
</div>
