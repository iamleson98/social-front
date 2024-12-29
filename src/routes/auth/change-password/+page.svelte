<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import type { ActionData } from './$types';
	import { page } from '$app/state';
	import { PasswordInput } from '$lib/components/ui/Input';

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

	{#if form}
		{#if form.error}
			<Alert variant="error" size="sm">
				{form.error}
			</Alert>
		{:else if form.data}
			<Alert variant="success" size="sm">
				{form.data}
			</Alert>
		{/if}
	{/if}
	<form
		action={`?email=${page.url.searchParams.get('email')}&token=${page.url.searchParams.get('token')}`}
		method="post"
		use:enhance
	>
		<PasswordInput
			name="newPassword"
			placeholder="New Password"
			bind:value={newPassword}
			required
			disabled={loading}
		/>
		<PasswordInput
			name="confirmNewPassword"
			placeholder="Confirm New Password"
			bind:value={confirmNewPassword}
			required
			disabled={loading}
			showAction={false}
		/>
		<Button variant="filled" size="sm" fullWidth type="submit" disabled={buttonDisabled} {loading}>
			Change Password
		</Button>
	</form>
</div>
