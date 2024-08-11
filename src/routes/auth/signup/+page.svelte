<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { ClosedEye, Email, Icon, Lock, OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData } from './$types';
	import Alert from '$lib/components/common/alert.svelte';
	import { tClient } from '$lib/i18n';

	const passwordButtonIconsMap = {
		password: OpenEye,
		text: ClosedEye
	};

	let email: string = $state('');
	let password: string = $state('');
	let firstName: string = $state('');
	let lastName: string = $state('');
	let confirmPassword: string = $state('');
	let loading = $state(false);
	let termAndPoliciesAgree = $state(false);
	let passwordFieldType: 'text' | 'password' = $state('password');

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

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('signup.title')}</h1>

	{#if form && form.error}
		<Alert variant="error" content={form.error} classes="mb-3" />
	{/if}
	<form action="?/signup" method="post" onsubmitcapture={handleSignup}>
		<div class="mb-3">
			<div class="flex flex-row mobile-m:flex-col justify-between items-center">
				<label
					class="input input-md w-[48%] input-bordered flex mobile-m:w-full mb-3"
					for="first_name"
				>
					<input
						type="text"
						name="first_name"
						class="w-full"
						id="first_name"
						placeholder={tClient('signup.firstNamePlaceholder')}
						bind:value={firstName}
						required
						disabled={loading}
					/>
				</label>
				<label
					class="input input-md w-[48%] input-bordered flex mobile-m:w-full mb-3"
					for="last_name"
				>
					<input
						type="text"
						name="last_name"
						class="w-full"
						id="last_name"
						placeholder={tClient('signup.lastNamePlaceholder')}
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
					placeholder={tClient('common.emailPlaceholder')}
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
					placeholder={tClient('common.passwordPlaceholder')}
					value={password}
					onkeyup={handlePasswordChange}
					required
					disabled={loading}
				/>
				<button type="button" class="btn btn-xs btn-circle" onclick={togglePasswordType}>
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
					placeholder={tClient('signup.confirmPasswordPlaceholder')}
					bind:value={confirmPassword}
					required
					disabled={loading}
				/>
			</label>

			<label
				for="term_aggree"
				class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"
			>
				<span class="mr-2">{tClient('signup.agreeToTerms')}</span>
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
