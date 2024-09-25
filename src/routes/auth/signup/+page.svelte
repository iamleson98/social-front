<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData } from './$types';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';

	let email: string = $state('');
	let password: string = $state('');
	let firstName: string = $state('');
	let lastName: string = $state('');
	let confirmPassword: string = $state('');
	let loading = $state(false);
	let termAndPoliciesAgree = $state(false);

	/**
	 * holds state of form element
	 */
	// export let form: ActionData;

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

	const handleSignup = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		loading = true;

		const response = await fetch(event.currentTarget.action, {
			method: event.currentTarget.method,
			body: new FormData(event.currentTarget)
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}

		applyAction(result);

		loading = false;
	};
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('signup.title')}</h1>

	{#if form && form.error}
		<Alert variant="error" class="mb-3">
			{form.error}
		</Alert>
	{/if}
	<form action="?/signup" method="post" onsubmitcapture={handleSignup}>
		<div class="mb-4">
			<div class="flex flex-row mobile-m:flex-col justify-between items-center gap-2 mb-2">
				<Input
					type="text"
					name="first_name"
					placeholder={tClient('signup.firstNamePlaceholder')}
					required
					disabled={loading}
					bind:value={firstName}
				/>
				<Input
					type="text"
					name="last_name"
					placeholder={tClient('signup.lastNamePlaceholder')}
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
				placeholder={tClient('common.passwordPlaceholder')}
				bind:value={password}
				class="mb-2"
				variant={passwordDontMatch ? 'error' : 'normal'}
			/>
			<PasswordInput
				placeholder={tClient('signup.confirmPasswordPlaceholder')}
				bind:value={confirmPassword}
				class="mb-3"
				showAction={false}
				variant={passwordDontMatch ? 'error' : 'normal'}
			/>

			<Checkbox
				label={tClient('signup.agreeToTerms')}
				name="term_aggree"
				id="term_aggree"
				class="mb-3"
				bind:checked={termAndPoliciesAgree as boolean}
			/>

			<Button
				variant="filled"
				type="submit"
				size="sm"
				fullWidth
				{loading}
				disabled={signupButtonDisabled}>{tClient('signup.signupButton')}</Button
			>
		</div>

		<!-- form other -->
		<div>
			<span class="text-xs text-gray-500">
				{tClient('signup.alreadyHasAccount')}
				<a href={AppRoute.AUTH_SIGNIN} class="text-blue-600">{tClient('signin.title')}</a>
			</span>
		</div>
	</form>
</div>
