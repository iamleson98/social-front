<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData } from './$types';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { method } from 'lodash-es';
	import { userStore } from '$lib/stores/auth/user';
	import { toastStore } from '$lib/stores/ui/toast';
	import { HTTPStatusSuccess } from '$lib/utils/consts';

	let email: string = $state('');
	let password: string = $state('');
	let firstName: string = $state('');
	let lastName: string = $state('');
	let confirmPassword: string = $state('');
	let loading = $state(false);
	let termAndPoliciesAgree = $state(false);
	let showSuccessMessage = $state(false);
	let responseMessage: string = $state('');

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let passwordDontMatch = $derived(password !== confirmPassword);
	let signupButtonDisabled = $derived(
		loading ||
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!password ||
			!confirmPassword ||
			!termAndPoliciesAgree
	);

	const handleSignup = async () => {
		loading = true;

		try {
			const signupResult = await fetch(AppRoute.AUTH_REGISTER, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					firstName,
					lastName,
					confirmPassword
				})
			}).then((res) => res.json());

			loading = false;

			if (signupResult.status !== HTTPStatusSuccess) {
				responseMessage = signupResult.error.message;
				showSuccessMessage = false;
				return;
			}

			responseMessage = tClient('signup.success');
			showSuccessMessage = true;

			if (signupResult.data) {
				userStore.set(signupResult.data);
				toastStore.send({
					message: tClient('signin.welcomeBack', {
						name: `${signupResult.data.firstName} ${signupResult.data.lastName}`
					}),
					variant: 'success'
				});
			}
		} catch (err) {
			loading = false;
			responseMessage = tClient('error.exceptionError');
			showSuccessMessage = false;
		}
	};
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('signup.title')}</h1>

	{#if responseMessage}
		<Alert variant={showSuccessMessage ? 'success' : 'error'} class="mb-3" bordered>
			{responseMessage}
		</Alert>
	{/if}

	<div class="mb-4">
		<div class="flex flex-row mobile-m:flex-col justify-between items-center gap-2 mb-2">
			<Input
				type="text"
				name="first_name"
				placeholder={tClient('common.firstName')}
				required
				disabled={loading}
				bind:value={firstName}
			/>
			<Input
				type="text"
				name="last_name"
				placeholder={tClient('common.lastName')}
				required
				disabled={loading}
				bind:value={lastName}
			/>
		</div>
		<Input
			type="email"
			name="email"
			placeholder={tClient('common.emailPlaceholder')}
			class="mb-2"
			required
			disabled={loading}
			bind:value={email}
			startIcon={Email}
		/>
		<PasswordInput
			name="password"
			placeholder={tClient('common.passwordPlaceholder')}
			bind:value={password}
			class="mb-2"
			variant={passwordDontMatch ? 'error' : 'info'}
			required
			showAction
		/>
		<PasswordInput
			name="confirmPassword"
			placeholder={tClient('signup.confirmPasswordPlaceholder')}
			bind:value={confirmPassword}
			class="mb-3"
			showAction={false}
			variant={passwordDontMatch ? 'error' : 'info'}
			required
		/>

		<Checkbox
			label={tClient('signup.agreeToTerms')}
			name="term_aggree"
			id="term_aggree"
			class="mb-3"
			bind:checked={termAndPoliciesAgree as boolean}
			required
		/>

		<Button
			variant="filled"
			type="button"
			size="sm"
			fullWidth
			{loading}
			disabled={signupButtonDisabled}
			onclick={handleSignup}>{tClient('signup.signupButton')}</Button
		>
	</div>

	<div>
		<span class="text-xs text-gray-500">
			{tClient('signup.alreadyHasAccount')}
			<a href={AppRoute.AUTH_SIGNIN} class="text-blue-600">{tClient('signin.title')}</a>
		</span>
	</div>
</div>
