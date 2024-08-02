<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components/common';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import {
		HTTPStatusBadRequest,
		HTTPStatusServerError,
		HTTPStatusSuccess
	} from '$lib/utils/consts';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import { Icon, Lock } from '$lib/components/icons';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	$effect(() => {
		if (form?.status === HTTPStatusSuccess) {
			let timeout = setTimeout(() => {
				clearTimeout(timeout);
				goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
			}, 3000);
		}
	});

	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let loading = $state(false);

	let buttonDisabled = $derived(
		loading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword
	);
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
		<Button variant="filled" size="sm" fullWidth type="submit" disabled={buttonDisabled} {loading}>
			Change Password
		</Button>
	</form>
</div>
