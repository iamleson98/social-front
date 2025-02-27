<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { tranFunc } from '$lib/i18n';
	import { Input } from '$lib/components/ui/Input';
	import { USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from '$lib/api/auth';
	import type { Mutation, MutationRequestPasswordResetArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { PUBLIC_LOCAL_URL } from '$env/static/public';
	import { string } from 'zod';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';

	let email = $state('');
	let emailError = $state<string>();

	const emailHint = $tranFunc('error.invalidEmail');
	const emailSchema = string().email({ message: emailHint }).nonempty({ message: emailHint });

	let resetPasswordStore =
		$state.raw<
			OperationResultStore<Pick<Mutation, 'requestPasswordReset'>, MutationRequestPasswordResetArgs>
		>();

	const validateForm = () => {
		const parseResult = emailSchema.safeParse(email);
		if (!parseResult.success) {
			emailError = parseResult.error.formErrors.formErrors[0];
			return false;
		}

		emailError = undefined;
		return true;
	};

	const handleRequestResetPassword = async () => {
		if (!validateForm()) return;

		resetPasswordStore = operationStore({
			kind: 'mutation',
			query: USER_REQUEST_PASSWORD_RESET_MUTATION_STORE,
			variables: {
				email,
				redirectUrl: PUBLIC_LOCAL_URL + AppRoute.AUTH_CHANGE_PASSWORD(),
				channel: clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug)
			}
		});
	};
</script>

<div class="w-md">
	<h1 class="p-2 mb-4">{$tranFunc('resetPassword.title')}</h1>
	{#if $resetPasswordStore}
		{@const { error, data, fetching } = $resetPasswordStore}
		{#if error}
			<Alert size="sm" variant="error" class="mb-3" bordered>
				{error.message}
			</Alert>
		{:else if data?.requestPasswordReset?.errors.length}
			<Alert size="sm" variant="error" class="mb-3" bordered>
				{data.requestPasswordReset.errors[0].message}
			</Alert>
		{:else if !fetching && !data?.requestPasswordReset?.errors.length}
			<Alert size="sm" variant="success" class="mb-3" bordered
				>{$tranFunc('resetPassword.emailSent')}</Alert
			>
		{/if}
	{/if}
	<Input
		type="email"
		placeholder={$tranFunc('common.emailPlaceholder')}
		bind:value={email}
		required
		disabled={$resetPasswordStore?.fetching}
		startIcon={Email}
		class="mb-1"
		variant={emailError ? 'error' : 'info'}
		subText={emailError}
		onblur={validateForm}
	/>
	<a href={AppRoute.AUTH_SIGNIN()} class="mb-3 text-right block text-xs text-blue-600"
		>{$tranFunc('signin.title')}</a
	>
	<Button
		variant="filled"
		size="sm"
		fullWidth
		disabled={!email.trim() || $resetPasswordStore?.fetching}
		loading={$resetPasswordStore?.fetching}
		onclick={handleRequestResetPassword}
	>
		{$tranFunc('resetPassword.btnText')}
	</Button>
</div>
