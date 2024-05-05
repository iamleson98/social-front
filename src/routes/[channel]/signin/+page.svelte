<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { HTTPStatusBadRequest, HTTPStatusServerError } from '$lib/utils/types';
	import type { ActionData } from './$types';

	const passwordButtonIconsMap = {
		password: 'icon-[system-uicons--eye]',
		text: 'icon-[system-uicons--eye-no]'
	};

	let checked: boolean = false;
	let passwordFieldType: 'text' | 'password' = 'password';
	let email: string = '';
	let password: string = '';
	let loading: boolean = false;

	export let form: ActionData;

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');

	const handlePasswordChange = (evt: any) => password = evt.currentTarget.value;
</script>

<svelte:head>
	<title>Signin</title>
</svelte:head>

<div class="max-w-md m-auto rounded-md p-2">
	{#if form && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<div class="text-xs text-red-500 bg-red-100 rounded p-2 mb-3">
			<p>{form.error}</p>
		</div>
	{/if}
	<form
		action="?/signin"
		method="post"
		use:enhance={() => {
			loading = true;

			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		<!-- form main -->
		<div class="mb-3">
			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
				for="email"
				class:input-error={form?.error}
			>
				<span class="icon-[system-uicons--mail]"></span>
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
				class="input input-md flex w-full input-bordered items-center gap-2 mb-4"
				for="password"
				class:input-error={form?.error}
			>
				<span class="icon-[system-uicons--lock]"></span>
				<input
					type={passwordFieldType}
					name="password"
					class="grow"
					id="password"
					placeholder="Enter your password *"
					value={password}
					required
					disabled={loading}
					on:keyup={handlePasswordChange}
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
				>Don't have account yet? <a href="/vi/signup" class="text-blue-600">Signup</a></span
			>
		</div>
	</form>
</div>
