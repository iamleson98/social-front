<script lang="ts">
	import { ClosedEye, Email, Lock, OpenEye } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { USER_SIGNUP_MUTATION_STORE } from '$lib/stores/api/auth';
	import { AppRoute } from '$lib/utils';
	import { DEFAULT_CHANNEL_NAME } from '$lib/utils/types';
	import type { EventHandler } from 'svelte/elements';

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
	let signupError: string | null = null;
	let redirectUrl = 'http://localhost:5173/';

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

	const handleSignup: EventHandler<SubmitEvent, HTMLFormElement> = async (event: any) => {
		loading = true; //

		USER_SIGNUP_MUTATION_STORE.mutate({
			input: {
				firstName,
				lastName,
				email,
				password,
				redirectUrl,
				channel: DEFAULT_CHANNEL_NAME
			}
		})
			.then((result) => {
				if (result.data?.accountRegister?.errors.length) {
					signupError = result.data?.accountRegister?.errors[0].message;
					return;
				}
				signupError = null;
			})
			.catch((err) => {
				signupError = err.message;
			})
			.finally(() => {
				loading = false;
			});
	};
</script>

<svelte:head>
	<title>Signup</title>
</svelte:head>

<div class="max-w-md rounded-md p-2">
	<h1 class="p-2 mb-4">Sign up</h1>

	{#if signupError}
		<div class="text-xs text-red-500 bg-red-100 rounded p-2 mb-3">
			<p>{signupError}</p>
		</div>
	{/if}
	<form action="?/signup" method="post" on:submit|preventDefault={handleSignup}>
		<!-- form main -->

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
						placeholder="Enter your first name *"
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
						placeholder="Enter your last name *"
						bind:value={lastName}
						required
						disabled={loading}
					/>
				</label>
			</div>

			<label class="input input-md flex w-full input-bordered items-center gap-2 mb-3" for="email">
				<span>
					<Email />
				</span>
				<input
					type="email"
					class="grow"
					name="email"
					id="email"
					placeholder="Enter your email *"
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
					<Lock />
				</span>
				<input
					type={passwordFieldType}
					name="password"
					class="grow"
					id="password"
					placeholder="Enter your password *"
					value={password}
					on:keyup={handlePasswordChange}
					required
					disabled={loading}
				/>
				<button type="button" class="btn btn-xs btn-circle" on:click={togglePasswordType}>
					<span>
						<svelte:component this={passwordButtonIconsMap[passwordFieldType]} />
					</span>
				</button>
			</label>
			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
				for="confirm_passwored"
				class:input-error={passwordDontMatch}
			>
				<span>
					<Lock />
				</span>
				<input
					type="password"
					name="confirm_passwored"
					class="grow"
					id="confirm_passwored"
					placeholder="Confirm your password *"
					bind:value={confirmPassword}
					required
					disabled={loading}
				/>
			</label>

			<label
				for="term_aggree"
				class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"
			>
				<span class="mr-2">I agree to terms and policies*</span>
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
				disabled={signupButtonDisabled}>Create Account</Button
			>
		</div>

		<!-- form other -->
		<div>
			<span class="text-xs text-gray-500"
				>Already have an account? <a href={AppRoute.AUTH_SIGNIN} class="text-blue-600">Signin</a
				></span
			>
		</div>
	</form>
</div>
