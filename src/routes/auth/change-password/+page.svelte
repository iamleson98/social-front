<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components/common';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { HTTPStatusBadRequest, HTTPStatusServerError, HTTPStatusSuccess } from '$lib/utils/consts';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Icon, Lock } from '$lib/components/icons';

	export let form: ActionData;
	let timeout: NodeJS.Timeout;

	$: if (form?.status === HTTPStatusSuccess) {
		timeout = setTimeout(() => {
			goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
		}, 3000);
	}

	onMount(() => {
		return () => clearTimeout(timeout);
	});

	let newPassword = '';
	let confirmNewPassword = '';
	let loading = false;
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">Set new password</h1>
	{#if form && form?.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<Alert content={form?.error} variant="error" classes="mb-3" />
	{:else if form && form?.status === HTTPStatusSuccess}
		<Alert variant="info" content={form?.data} classes="mb-3" />
	{/if}
	<form
		action={`?email=${$page.url.searchParams.get('email')}&token=${$page.url.searchParams.get('token')}`}
		method="post"
		use:enhance
	>
		<label
			class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
			for="newPassword"
			class:input-error={form?.error}
		>
			<span>
				<Icon icon={Lock} />
			</span>
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
			<span>
				<Icon icon={Lock} />
			</span>
			<input
				type="password"
				name="confirmNewPassword"
				class="grow"
				id="confirmNewPassword"
				placeholder="Confirm New Password"
				bind:value={confirmNewPassword}
				required
				disabled={loading}
			/>
		</label>
		<Button
			variant="filled"
			size="sm"
			fullWidth
			type="submit"
			disabled={loading ||
				!newPassword ||
				!confirmNewPassword ||
				newPassword !== confirmNewPassword}
			bind:loading
		>
			Change Password
		</Button>
	</form>
</div>
