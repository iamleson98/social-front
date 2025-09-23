<script lang="ts">
	import { PUBLIC_LOCAL_URL } from '$env/static/public';
	import { USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from '$lib/api/auth';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { Mutation, MutationRequestPasswordResetArgs } from '$lib/gql/graphql';
	import { tranFunc } from '$lib/i18n';
	import { AppRoute } from '$lib/utils';
	import { DEFAULT_CHANNEL } from '$lib/utils/channels';
	import { CHANNEL_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { string } from 'zod';

	let email = $state('');
	let emailError = $state<string>();
	let loading = $state(false);

	const emailHint = $tranFunc('error.invalidEmail');
	const emailSchema = string().email({ message: emailHint }).nonempty({ message: emailHint });

	const validateForm = () => {
		const parseResult = emailSchema.safeParse(email);
		emailError = parseResult.success ? undefined : parseResult.error.formErrors.formErrors[0];
		return parseResult.success;
	};

	const handleRequestResetPassword = async () => {
		if (!validateForm()) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'requestPasswordReset'>,
			MutationRequestPasswordResetArgs
		>(USER_REQUEST_PASSWORD_RESET_MUTATION_STORE, {
			email,
			redirectUrl: PUBLIC_LOCAL_URL + AppRoute.AUTH_CHANGE_PASSWORD(),
			channel: clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug),
		});
		loading = false;

		checkIfGraphqlResultHasError(
			result,
			'requestPasswordReset',
			$tranFunc('resetPassword.emailSent'),
		);
	};
</script>

<div class="w-md">
	<h1 class="p-2 mb-4">{$tranFunc('resetPassword.title')}</h1>
	<Input
		type="email"
		placeholder={$tranFunc('common.emailPlaceholder')}
		bind:value={email}
		required
		disabled={loading}
		startIcon={Email}
		class="mb-1"
		variant={emailError ? 'error' : 'info'}
		subText={emailError}
		onblur={validateForm}
	/>
	<a href={AppRoute.AUTH_SIGNIN()} class="mb-3 text-right block text-xs text-blue-600">
		{$tranFunc('signin.title')}
	</a>
	<Button
		variant="filled"
		size="sm"
		fullWidth
		disabled={loading || !!emailError}
		{loading}
		onclick={handleRequestResetPassword}
	>
		{$tranFunc('resetPassword.btnText')}
	</Button>
</div>
