<script lang="ts">
	import { Alert } from '$lib/components/ui/Alert';
	import { Button } from '$lib/components/ui';
	import { page } from '$app/state';
	import { PasswordInput } from '$lib/components/ui/Input';
	import { tranFunc } from '$i18n';
	import { object, string, z } from 'zod';
	import type { Mutation, MutationPasswordChangeArgs, MutationSetPasswordArgs } from '$lib/gql/graphql';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import { USER_SET_PASSWORD_MUTATION_STORE } from '$lib/api/auth';
	import { omit } from 'es-toolkit';
	import { goto } from '$app/navigation';
	import { AppRoute } from '$lib/utils';

	const ChangePasswordSchema = object({
		password: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		confirmPassword: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		email: string(),
		token: string()
	}).refine((data) => data.password === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword']
	});

	type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

	const TOKEN = page.url.searchParams.get('token') as string;
	const EMAIL = page.url.searchParams.get('email') as string;

	let changePasswordForm = $state<ChangePasswordForm>({
		password: '',
		confirmPassword: '',
		email: EMAIL,
		token: TOKEN
	});

	let changePasswordMutationStore =
		$state<OperationResultStore<Pick<Mutation, 'setPassword'>, MutationSetPasswordArgs>>();

	let changePasswordErrors = $state<Partial<Record<keyof ChangePasswordForm, string[]>>>({});

	const validateForm = () => {
		const parseResult = ChangePasswordSchema.safeParse(changePasswordForm);
		if (!parseResult.success) {
			changePasswordErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}

		changePasswordErrors = {};
		return true;
	};

	$effect(() => {
		if (!changePasswordMutationStore) return;

		return changePasswordMutationStore.subscribe((result) => {
			if (result.data?.setPassword?.user)
				goto(AppRoute.AUTH_SIGNIN(), { replaceState: true, invalidateAll: true });
		});
	});

	const handleSubmit = () => {
		if (!validateForm()) return;

		changePasswordMutationStore = operationStore({
			kind: 'mutation',
			query: USER_SET_PASSWORD_MUTATION_STORE,
			requestPolicy: 'network-only',
			variables: omit(changePasswordForm, ['confirmPassword'])
		});
	};
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('changePassword.title')}</h1>

	{#if $changePasswordMutationStore?.error}
		<Alert variant="error" size="sm" bordered class="mb-2">
			{$changePasswordMutationStore.error.message}
		</Alert>
	{:else if $changePasswordMutationStore?.data?.setPassword?.errors.length}
		<Alert variant="error" size="sm" bordered class="mb-2">
			{$changePasswordMutationStore.data.setPassword.errors[0].message}
		</Alert>
	{/if}

	<PasswordInput
		placeholder="New Password"
		label="New Password"
		bind:value={changePasswordForm.password}
		required
		disabled={$changePasswordMutationStore?.fetching}
		variant={changePasswordErrors?.password?.length ? 'error' : 'info'}
		subText={changePasswordErrors?.password?.length ? changePasswordErrors.password[0] : ''}
		class="mb-2"
		onblur={validateForm}
	/>
	<PasswordInput
		placeholder="Confirm New Password"
		label="Confirm New Password"
		bind:value={changePasswordForm.confirmPassword}
		required
		disabled={$changePasswordMutationStore?.fetching}
		variant={changePasswordErrors?.confirmPassword?.length ? 'error' : 'info'}
		subText={changePasswordErrors?.confirmPassword?.length
			? changePasswordErrors.confirmPassword[0]
			: ''}
		showAction={false}
		class="mb-2"
		onblur={validateForm}
	/>
	<Button
		variant="filled"
		size="sm"
		fullWidth
		onclick={handleSubmit}
		disabled={$changePasswordMutationStore?.fetching}
		loading={$changePasswordMutationStore?.fetching}
	>
		{$tranFunc('changePassword.btnText')}
	</Button>
</div>
