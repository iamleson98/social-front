<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ClosedEye, Email, Icon, Lock, OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { HTTPStatusBadRequest, HTTPStatusServerError } from '$lib/utils/consts';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData } from './$types';
	import Alert from '$lib/components/common/alert.svelte';
	import { t } from '$lib/i18n';

	const passwordButtonIconsMap = {
		password: OpenEye,
		text: ClosedEye
	};

	let email: string = '';
	let password: string = '';
	let firstName: string = '';
	let lastName: string = '';
	let confirmPassword: string = '';
	let loading = false;
	let termAndPoliciesAgree = false;
	let passwordFieldType: 'text' | 'password' = 'password';

	/**
	 * holds state of form element
	 */
	export let form: ActionData;

	$: passwordDontMatch = password !== confirmPassword;
	$: signupButtonDisabled =
		loading ||
		!firstName.trim() ||
		!lastName.trim() ||
		!email.trim() ||
		!password ||
		!confirmPassword ||
		!termAndPoliciesAgree;

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');

	const handlePasswordChange = (evt: any) => (password = evt.currentTarget.value);

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

<svelte:head>
	<title>Signup</title>
</svelte:head>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{$t('auth.signup.title')}</h1>

	{#if form && form.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<Alert variant="error" content={form.error} classes="mb-3" />
	{/if}
	<form action="?/signup" method="post" on:submit|preventDefault={handleSignup}>
		<div class="mb-3">
			<div class="flex flex-row mobile-m:flex-col justify-between items-center">
				<label
					class="input input-md input-bordered w-[48%] flex mobile-m:w-full mb-3"
					for="first_name"
				>
					<input
						type="text"
						class="grow"
						name="first_name"
						id="first_name"
						placeholder={$t('auth.signup.firstNamePlaceholder')}
						bind:value={firstName}
						required
						disabled={loading}
					/>
				</label>
				<label
					class="input input-md input-bordered w-[48%] flex mobile-m:w-full mb-3"
					for="last_name"
				>
					<input
						type="text"
						class="grow"
						name="last_name"
						id="last_name"
						placeholder={$t('auth.signup.lastNamePlaceholder')}
						bind:value={lastName}
						required
						disabled={loading}
					/>
				</label>
			</div>

			<label class="input input-md flex w-full input-bordered items-center gap-2 mb-3" for="email">
				<span>
					<Icon icon={Email} />
				</span>
				<input
					type="email"
					class="grow"
					name="email"
					id="email"
					placeholder={$t('auth.signup.emailPlaceholder')}
					bind:value={email}
					required
					disabled={loading}
				/>
			</label>

			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
				for="password"
				class:input-error={passwordDontMatch}
			>
				<span>
					<Icon icon={Lock} />
				</span>
				<input
					type={passwordFieldType}
					name="password"
					class="grow"
					id="password"
					placeholder={$t('auth.signup.passwordPlaceholder')}
					value={password}
					on:keyup={handlePasswordChange}
					required
					disabled={loading}
				/>
				<button type="button" class="btn btn-xs btn-circle" on:click={togglePasswordType}>
					<Icon icon={passwordButtonIconsMap[passwordFieldType]} />
				</button>
			</label>
			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
				for="confirmPassword"
				class:input-error={passwordDontMatch}
			>
				<span>
					<Icon icon={Lock} />
				</span>
				<input
					type="password"
					name="confirmPassword"
					class="grow"
					id="confirmPassword"
					placeholder={$t('auth.signup.confirmPasswordPlaceholder')}
					bind:value={confirmPassword}
					required
					disabled={loading}
				/>
			</label>

			<label
				for="term_aggree"
				class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"
			>
				<span class="mr-2">{$t('auth.signup.agreeToTerms')}</span>
				<input
					type="checkbox"
					class="toggle toggle-xs toggle-info"
					id="term_aggree"
					name="term_aggree"
					bind:checked={termAndPoliciesAgree}
				/>
			</label>

			<Button
				variant="filled"
				type="submit"
				size="sm"
				fullWidth
				bind:loading
				disabled={signupButtonDisabled}>{$t('auth.signup.signupButton')}</Button
			>
		</div>

		<!-- form other -->
		<div>
			<span class="text-xs text-gray-500">
				{$t('auth.signup.alreadyHasAccount')}
				<a href={AppRoute.AUTH_SIGNIN} class="text-blue-600">{$t('auth.signin.title')}</a>
			</span>
		</div>
	</form>
</div>
