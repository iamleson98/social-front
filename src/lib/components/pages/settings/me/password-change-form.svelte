<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PASSWORD_UPDATE_MUTATION } from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Label, PasswordInput } from '$lib/components/ui/Input';
	import type { Mutation, MutationPasswordChangeArgs } from '$lib/gql/graphql';
	import { handleLogout } from '$lib/utils/auth.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { object, string, z } from 'zod';

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const PasswordSchema = object({
		oldPassword: string().min(1, { message: FIELD_REQUIRED }),
		newPassword: string().min(1, { message: FIELD_REQUIRED }),
		confirmPassword: string().min(1, { message: FIELD_REQUIRED }),
	}).refine((data) => data.newPassword === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword'],
	});

	type PasswordProps = z.infer<typeof PasswordSchema>;

	let passwordInputs = $state<PasswordProps>({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	let passwordFormErrors = $state.raw<Partial<Record<keyof PasswordProps, string[]>>>({});

	let passwordChanged = $derived.by(() => {
		return (
			passwordInputs.oldPassword !== '' &&
			passwordInputs.newPassword !== '' &&
			passwordInputs.confirmPassword !== '' &&
			passwordInputs.newPassword === passwordInputs.confirmPassword
		);
	});
	let loading = $state(false);

	const passwordValidate = () => {
		const passwordInfoParse = PasswordSchema.safeParse(passwordInputs);
		passwordFormErrors = passwordInfoParse.success
			? {}
			: passwordInfoParse.error.formErrors.fieldErrors;

		return passwordInfoParse.success;
	};

	const handleSubmit = async () => {
		if (!passwordValidate()) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'passwordChange'>,
			MutationPasswordChangeArgs
		>(PASSWORD_UPDATE_MUTATION, {
			oldPassword: passwordInputs.oldPassword,
			newPassword: passwordInputs.newPassword,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'passwordChange', $tranFunc('settings.passwordUpdated'))
		)
			return;

		// if success, we should logout user and redirect him to login
		await handleLogout($tranFunc);
	};
</script>

{#snippet label()}
	<Label size="lg" label={$tranFunc('settings.pwdUpdate')} class="cursor-pointer!" />
{/snippet}

<Accordion header={label} class="bg-white p-4! mt-2 border border-gray-200" open={false}>
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.oldPwd')}
		label={$tranFunc('settings.oldPwd')}
		bind:value={passwordInputs.oldPassword}
		showAction
		variant={passwordFormErrors.oldPassword?.length ? 'error' : 'info'}
		subText={passwordFormErrors.oldPassword?.[0]}
		onblur={passwordValidate}
		disabled={loading}
		inputDebounceOption={{ onInput: passwordValidate }}
	/>
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.newPwd')}
		label={$tranFunc('settings.newPwd')}
		bind:value={passwordInputs.newPassword}
		showAction
		variant={passwordFormErrors.newPassword?.length ? 'error' : 'info'}
		subText={passwordFormErrors.newPassword?.[0]}
		onblur={passwordValidate}
		disabled={loading}
		inputDebounceOption={{ onInput: passwordValidate }}
	/>
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.confirmPwd')}
		label={$tranFunc('settings.confirmPwd')}
		bind:value={passwordInputs.confirmPassword}
		variant={passwordFormErrors.confirmPassword?.length ? 'error' : 'info'}
		onblur={passwordValidate}
		disabled={loading}
		inputDebounceOption={{ onInput: passwordValidate }}
		subText={passwordFormErrors.confirmPassword?.[0]}
	/>

	<div class="text-right mt-4">
		<Button onclick={handleSubmit} {loading} disabled={loading || !passwordChanged}>
			{$tranFunc('btn.update')}
		</Button>
	</div>
</Accordion>
