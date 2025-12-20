<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { USER_SET_PASSWORD_MUTATION_STORE } from '$lib/api/auth';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { PasswordInput } from '$lib/components/ui/Input';
	import type { Mutation, MutationSetPasswordArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { omit } from 'es-toolkit';
	import { object, string, z } from 'zod';

	const ChangePasswordSchema = object({
		password: string().nonempty({ message: $T('helpText.fieldRequired') }),
		confirmPassword: string().nonempty({ message: $T('helpText.fieldRequired') }),
		email: string(),
		token: string(),
	}).refine((data) => data.password === data.confirmPassword, {
		message: $T('error.passwordsNotMatch'),
		path: ['confirmPassword'],
	});
	const SchemaHandler = createSchemaHandler(ChangePasswordSchema, () => ({
		password: changePasswordForm.password,
		confirmPassword: changePasswordForm.confirmPassword,
		email: changePasswordForm.email,
		token: changePasswordForm.token,
	}));

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

	const handleSubmit = async () => {
		if (!SchemaHandler.validate()) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'setPassword'>,
			MutationSetPasswordArgs
		>(USER_SET_PASSWORD_MUTATION_STORE, omit(changePasswordForm, ['confirmPassword']));
		loading = false;

	if (checkIfGraphqlResultHasError(result, 'setPassword', $T('changePassword.success'))) return;

		await goto(AppRoute.AUTH_SIGNIN(), { replaceState: true, invalidateAll: true });
	};
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$T('changePassword.title')}</h1>

	<PasswordInput
		placeholder={$T('changePassword.newPwdPlaceholder')}
		label={$T('changePassword.newPwdLabel')}
		bind:value={changePasswordForm.password}
		required
		disabled={loading}
		variant={$SchemaHandler?.password?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.password?.length ? $SchemaHandler.password[0] : ''}
		class="mb-2"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		showAction
	/>
	<PasswordInput
		placeholder={$T('changePassword.confirmNewPwdPlaceholder')}
		label={$T('changePassword.confirmNewPwdLabel')}
		bind:value={changePasswordForm.confirmPassword}
		required
		disabled={loading}
		variant={$SchemaHandler?.confirmPassword?.length ? 'error' : 'info'}
		subText={$SchemaHandler?.confirmPassword?.length ? $SchemaHandler.confirmPassword[0] : ''}
		showAction={false}
		class="mb-2"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
	/>
	<Button variant="filled" size="sm" fullWidth onclick={handleSubmit} disabled={loading} {loading}>
		{$T('changePassword.btnText')}
	</Button>
</div>
