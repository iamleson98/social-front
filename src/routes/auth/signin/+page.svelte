<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import { HTTPStatusBadRequest, HTTPStatusServerError } from '$lib/utils/types';
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import type { User } from '$lib/gql/graphql';

	const passwordButtonIconsMap = {
		password: 'icon-[system-uicons--eye]',
		text: 'icon-[system-uicons--eye-no]'
	};

	let rememberCheck: boolean = false;
	let passwordFieldType: 'text' | 'password' = 'password';
	let email: string = '';
	let password: string = '';
	let loading: boolean = false;

	/**
	 * holds state of form element
	 */
	export let form: ActionData;

	$: if (!form?.error && form?.data) {
		userStore.set(form.data);
	}

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');

	const handlePasswordChange = (evt: any) => (password = evt.currentTarget.value);

	const handleFormSubmit = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
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
	<title>Signin</title>
</svelte:head>

<div class="max-w-md m-auto rounded-md p-2">
	{#if form && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<div class="text-xs text-red-500 bg-red-100 rounded p-2 mb-3" transition:fade>
			<p>{form.error}</p>
		</div>
	{/if}
	<form action="?/signin" method="post" on:submit|preventDefault={handleFormSubmit}>
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
					bind:checked={rememberCheck}
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
				>Don't have account yet? <a href={AppRoute.AUTH_REGISTER} class="text-blue-600">Signup</a
				></span
			>
		</div>
	</form>

	<div class="flex flex-row justify-between items-center">
		<Button>
			<span class="icon-[grommet-icons--facebook-option]"></span>
		</Button>
		<Button>
			<span class="icon-[grommet-icons--facebook-option]"></span>
		</Button>
		<Button>
			<span class="icon-[grommet-icons--facebook-option]"></span>
		</Button>
	</div>
</div>
