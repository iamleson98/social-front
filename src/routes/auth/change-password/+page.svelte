<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert } from '$lib/components/common';
	import { Button } from '$lib/components/ui';
	import { HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess } from '$lib/utils/types';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let newPassword = '';
    let conformNewPassword = '';
	let loading = false;
</script>

<svelte:head>
	<title>Change password</title>
</svelte:head>

<div class="max-w-md rounded-md p-2">
	<h1 class="p-2 mb-4">New Password</h1>
		<Alert
			display={form &&
				form?.status &&
				[HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
			content={form?.error}
			variant="error"
			classes="mb-3"
		/>
		<Alert
			display={form && form?.status === HTTPStatusSuccess}
			variant="info"
			content={form?.data}
			classes="mb-3"
		/>
	<form action="?/request_password_reset" method="post" use:enhance>
		<label
			class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
			for="newPassword"
			class:input-error={form?.error}
		>
			<span class="icon-[system-uicons--lock]"></span>
			<input
				type="password"
				name="newPassword"
				class="grow"
				id="newPassword"
				placeholder="New Password"
				bind:value={newPassword}
				required
				disabled={loading}
			/>
		</label>
        <label
			class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
			for="confirmNewPassword"
			class:input-error={form?.error}
		>
			<span class="icon-[system-uicons--lock]"></span>
			<input
				type="password"
				name="confirmNewPassword"
				class="grow"
				id="confirmNewPassword"
				placeholder="Confirm New Password"
				bind:value={conformNewPassword}
				required
				disabled={loading}
			/>
		</label>
		<Button
			variant="filled"
			size="sm"
			fullWidth
			type="submit"
			disabled={loading || !newPassword.trim() || !conformNewPassword.trim()}
			bind:loading
		>
			Change Password
		</Button>
	</form>
</div>
