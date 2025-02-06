<script lang="ts">
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

	let loading = $state(false);

	type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;
	let changePasswordValue = $state<ChangePasswordSchema>({
		newPassword: '',
		confirmNewPassword: ''
	});
	let changePasswordFormErrors = $state.raw<Partial<Record<keyof ChangePasswordSchema, string[]>>>(
		{}
	);
	let changePasswordQueryStore =
		$state<
			OperationResultStore<
				Pick<Mutation, 'accountChangePassword'>,
				MutationAccountChangePasswordArgs
			>
		>();

	const validateForm = () => {
		const parseResult = ChangePasswordSchema.safeParse(changePasswordValue);
		if (!parseResult.success) {
			changePasswordFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		changePasswordFormErrors = {};
		return true;
	};

	const handleSubmit = () => {
		if (!validateForm()) return;
		loading = true;
		const token = $page().url.searchParams.get('token');
		const email = $page().url.searchParams.get('email');

		changePasswordQueryStore = operationStore<
			Pick<Mutation, 'accountChangePassword'>,
			MutationAccountChangePasswordArgs
		>({
			kind: 'mutation',
			query: USER_CHANGE_PASSWORD_MUTATION_STORE,
			variables: {
				input: { email, token, changePasswordValue }
			},
			context: {
				requestPolicy: 'network-only'
			}
		});
		loading = false;
	};
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('changePassword.title')}</h1>

	{#if $changePasswordQueryStore?.error}
		<Alert variant="error" class="mb-3" bordered size="sm">
			{$changePasswordQueryStore.error.message}
		</Alert>
	{:else if $changePasswordQueryStore?.data?.accountChangePassword?.errors.length}
		<Alert variant="error" class="mb-3" bordered size="sm">
			{$changePasswordQueryStore.data.accountChangePassword.errors[0].message}
		</Alert>
	{:else if $changePasswordQueryStore?.data?.accountChangePassword?.user}
		<Alert variant="success" class="mb-3" bordered size="sm">
			{$tranFunc('changePassword.changePasswordSuccess')}
		</Alert>
	{/if}

	<PasswordInput
		name="newPassword"
		placeholder="New Password"
		bind:value={changePasswordValue.newPassword}
		required
		disabled={loading}
	/>
	<PasswordInput
		name="confirmNewPassword"
		placeholder="Confirm New Password"
		bind:value={changePasswordValue.confirmNewPassword}
		required
		disabled={loading}
		showAction={false}
	/>
	<Button
		variant="filled"
		size="sm"
		fullWidth
		type="submit"
		on:click={handleSubmit}
		disabled={loading}
	>
		{$tranFunc('changePassword.btnText')}
	</Button>
</div>
