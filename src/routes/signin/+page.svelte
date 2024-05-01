<script lang="ts">
	import { graphql } from '$houdini';
	import { Button } from '$lib/components/ui';

	const passwordButtonIconsMap = {
		password: 'icon-[system-uicons--eye]',
		text: 'icon-[system-uicons--eye-no]'
	};

	let checked: boolean = false;
	let passwordFieldType: 'text' | 'password' = 'password';
	let email: string = '';
	let password: string = '';
	let loginError: any | null = null;
	let loading: boolean = false;

	function togglePasswordType() {
		passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password';
	}

	function handleLogin() {
		loading = true;

		const loginMutation = graphql(`
			mutation TokenCreate($email: String!, $password: String!) {
				tokenCreate(email: $email, password: $password) {
					token
					refreshToken
					user {
						id
						email
					}
					errors {
						field
						message
						code
					}
				}
			}
		`);

		loginMutation
			.mutate({ email, password })
			.then((res) => {
				if (res.data?.tokenCreate?.errors.length) {
					loginError = res.data?.tokenCreate?.errors[0].message;
					return;
				}

				loginError = null;
				localStorage.setItem('token', res.data?.tokenCreate?.token as string);
			})
			.catch((err: Error) => {
				loginError = err.message;
			})
			.finally(() => (loading = false));
	}
</script>

<svelte:head>
	<title>Signin</title>
</svelte:head>

<div class="max-w-md m-auto rounded-md p-2">
	{#if loginError}
		<div class="text-xs text-red-500 bg-red-100 rounded p-2 mb-3">
			<p>{loginError}</p>
		</div>
	{/if}
	<form action="" method="post" on:submit|preventDefault={handleLogin}>
		<!-- form main -->
		<div class="mb-3">
			<label
				class="input input-sm flex w-full input-bordered items-center gap-2 mb-3"
				for="email"
				class:input-error={!!loginError}
			>
				<span class="icon-[system-uicons--mail]"></span>
				<input
					type="email"
					class="grow"
					name="email"
					id="email"
					placeholder="Enter your email"
					bind:value={email}
				/>
			</label>

			<label
				class="input input-sm flex w-full input-bordered items-center gap-2 mb-4 input-error"
				for="password"
				class:input-error={!!loginError}
			>
				<span class="icon-[system-uicons--lock]"></span>
				<input
					type={passwordFieldType}
					name="password"
					class="grow"
					id="password"
					placeholder="Enter your password"
					bind:value={password}
				/>
				<button type="button" class="btn btn-xs btn-circle" on:click={togglePasswordType}>
					<span class={passwordButtonIconsMap[passwordFieldType]}></span>
				</button>
			</label>

			<label
				for="remember-me"
				class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"
			>
				<span class="mr-2">remember me</span>
				<input
					type="checkbox"
					class="toggle toggle-xs toggle-info"
					id="remember-me"
					name="remember-me"
					bind:checked
				/>
			</label>

			<Button
				variant="filled"
				type="submit"
				size="sm"
				fullWidth
				bind:loading
				disabled={loading || !email.trim() || !password}>Let me in</Button
			>
		</div>

		<!-- form other -->
		<div>
			<span class="text-xs text-gray-500"
				>Don't have account yet? <a href="/signup" class="text-blue-600">Signup</a></span
			>
		</div>
	</form>
</div>
