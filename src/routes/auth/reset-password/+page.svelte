<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import {
		defaultChannel,
	} from '$lib/utils/consts';
	import { tClient } from '$lib/i18n';
	import { Input } from '$lib/components/ui/Input';
	import { USER_REQUEST_PASSWORD_RESET_MUTATION_STORE } from '$lib/stores/api/auth';
	import type { Mutation, MutationRequestPasswordResetArgs } from '$lib/gql/graphql';
	import { graphqlClient } from '$lib/client';
	import { AppRoute } from '$lib/utils';
	import { preHandleGraphqlResult } from '$lib/utils/utils';
	import { toastStore } from '$lib/stores/ui/toast';

	let email = $state('');
	let loading = $state(false);
	let disabled = $derived.by(() => !email.trim() || loading);

	const handleRequestResetPassword = async () => {
		loading = true;

		const requestResult = await graphqlClient.mutation<
			Pick<Mutation, 'requestPasswordReset'>,
			MutationRequestPasswordResetArgs
		>(USER_REQUEST_PASSWORD_RESET_MUTATION_STORE, {
			email,
			redirectUrl: import.meta.env.VITE_LOCAL_URL + AppRoute.AUTH_CHANGE_PASSWORD,
			channel: defaultChannel.slug
		});

		loading = false;

		if (preHandleGraphqlResult(requestResult)) return;
		if (requestResult.data?.requestPasswordReset?.errors.length) {
			toastStore.send({
				variant: 'error',
				message: requestResult.data.requestPasswordReset.errors[0].message as string,
			});
			return;
		}

		toastStore.send({
			variant: 'success',
			message: 'An email has been sent to you',
		});
	};
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('resetPassword.title')}</h1>
	<Input
		type="email"
		placeholder={tClient('common.emailPlaceholder')}
		bind:value={email}
		required
		disabled={loading}
		startIcon={Email}
		class="mb-2"
	/>
	<Button
		variant="filled"
		size="sm"
		fullWidth
		{disabled}
		{loading}
		onclick={handleRequestResetPassword}
	>
		{tClient('resetPassword.btnText')}
	</Button>
</div>
