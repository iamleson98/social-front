<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button } from '$lib/components/ui';
	import { page } from '$app/state';
	import { PasswordInput } from '$lib/components/ui/Input';
	import { tranFunc } from '$i18n';
	import { object, string } from 'zod';

	const ChangePasswordSchema = object({
		password: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		confirmPassword: string().nonempty({ message: $tranFunc('helpText.fieldRequired') })
	}).refine((data) => data.password === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword']
	});

	let changePasswordStore = $state<>()

	let newPassword = $state('');
	let confirmNewPassword = $state('');
	let loading = $state(false);

	let buttonDisabled = $derived(
		loading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword
	);
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('changePassword.title')}</h1>

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
			{$tranFunc('changePassword.btnText')}
		</Button>
	</form>
</div>
