<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { defaultChannel } from '$lib/utils/consts';
	import { tranFunc } from '$lib/i18n';
	import { Input } from '$lib/components/ui/Input';
	import { USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from '$lib/stores/api/auth';
	import type { Mutation, MutationRequestPasswordResetArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { operationStore, type OperationResultStore } from '$lib/stores/api/operation';
	import { Alert } from '$lib/components/ui/Alert';

	let email = $state('');

	let resetPasswordStore =
		$state.raw<
			OperationResultStore<Pick<Mutation, 'requestPasswordReset'>, MutationRequestPasswordResetArgs>
		>();

	const handleRequestResetPassword = async () => {
		resetPasswordStore = operationStore({
			kind: 'mutation',
			query: USER_REQUEST_PASSWORD_RESET_MUTATION_STORE,
			variables: {
				email,
				redirectUrl: import.meta.env.VITE_LOCAL_URL + AppRoute.AUTH_CHANGE_PASSWORD,
				channel: defaultChannel.slug
			}
		});
	};
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('resetPassword.title')}</h1>
	{#if $resetPasswordStore?.error}
		<Alert variant="error" class="mb-3" bordered>
			{$resetPasswordStore.error.message}
		</Alert>
	{:else if $resetPasswordStore?.data?.requestPasswordReset?.errors.length}
		<Alert variant="error" class="mb-3" bordered>
			{$resetPasswordStore.data.requestPasswordReset.errors[0].message}
		</Alert>
	{:else}
		<Alert variant="success" class="mb-3" bordered>{$tranFunc('resetPassword.emailSent')}</Alert>
	{/if}
	<Input
		type="email"
		placeholder={$tranFunc('common.emailPlaceholder')}
		bind:value={email}
		required
		disabled={$resetPasswordStore?.fetching}
		startIcon={Email}
		class="mb-2"
	/>
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
