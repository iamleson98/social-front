<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert } from '$lib/components/common';
	import { Button } from '$lib/components/ui';
	import { HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess } from '$lib/utils/types';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let email = '';
	let loading = false;
</script>

<svelte:head>
	<title>Reset password</title>
</svelte:head>

<div class="max-w-md rounded-md p-2">
	<h1 class="p-2 mb-4">Reset Password</h1>
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
			for="email"
			class:input-error={form?.error}
		>
			<span class="icon-[system-uicons--mail]"></span>
			<input
				type="email"
				name="email"
				class="grow"
				id="email"
				placeholder="Enter your email *"
				bind:value={email}
				required
				disabled={loading}
			/>
		</label>
		<Button
			variant="filled"
			size="sm"
			fullWidth
			type="submit"
			disabled={loading || !email.trim()}
			bind:loading
		>
			Send me email
		</Button>
	</form>
</div>
