<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import { USER_SET_PASSWORD_MUTATION_STORE } from '$lib/api/auth';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { PasswordInput } from '$lib/components/ui/Input';
	import type { Mutation, MutationSetPasswordArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { omit } from 'es-toolkit';
	import { object, string, z } from 'zod';

	const ChangePasswordSchema = object({
		password: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		confirmPassword: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		email: string(),
		token: string(),
	}).refine((data) => data.password === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword'],
	});

	type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

	const TOKEN = page.url.searchParams.get('token') as string;
	const EMAIL = page.url.searchParams.get('email') as string;

	let changePasswordForm = $state<ChangePasswordForm>({
		password: '',
		confirmPassword: '',
		email: EMAIL,
		token: TOKEN,
	});
	let loading = $state(false);

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

	const handleSubmit = async () => {
		if (!validateForm()) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'setPassword'>,
			MutationSetPasswordArgs
		>(USER_SET_PASSWORD_MUTATION_STORE, omit(changePasswordForm, ['confirmPassword']));
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'setPassword', 'Password reset successfully')) return;

		await goto(AppRoute.AUTH_SIGNIN(), { replaceState: true, invalidateAll: true });
	};
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('changePassword.title')}</h1>

	<PasswordInput
		placeholder="New Password"
		label="New Password"
		bind:value={changePasswordForm.password}
		required
		disabled={loading}
		variant={changePasswordErrors?.password?.length ? 'error' : 'info'}
		subText={changePasswordErrors?.password?.length ? changePasswordErrors.password[0] : ''}
		class="mb-2"
		inputDebounceOption={{ onInput: validateForm }}
		onblur={validateForm}
		showAction
	/>
	<PasswordInput
		placeholder="Confirm New Password"
		label="Confirm New Password"
		bind:value={changePasswordForm.confirmPassword}
		required
		disabled={loading}
		variant={changePasswordErrors?.confirmPassword?.length ? 'error' : 'info'}
		subText={changePasswordErrors?.confirmPassword?.length
			? changePasswordErrors.confirmPassword[0]
			: ''}
		showAction={false}
		class="mb-2"
		inputDebounceOption={{ onInput: validateForm }}
		onblur={validateForm}
	/>
	<Button variant="filled" size="sm" fullWidth onclick={handleSubmit} disabled={loading} {loading}>
		{$tranFunc('changePassword.btnText')}
	</Button>
</div>
