<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PASSWORD_UPDATE_MUTATION } from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { PasswordInput } from '$lib/components/ui/Input';
	import type { Mutation, MutationPasswordChangeArgs } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { slide } from 'svelte/transition';
	import { object, string, z } from 'zod';

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const PasswordSchema = object({
		oldPassword: string().min(1, { message: FIELD_REQUIRED }),
		newPassword: string().min(1, { message: FIELD_REQUIRED }),
		confirmPassword: string().min(1, { message: FIELD_REQUIRED })
	}).refine((data) => data.newPassword === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword']
	});

	type PasswordProps = z.infer<typeof PasswordSchema>;

	let passwordInputs = $state<PasswordProps>({
		oldPassword: '',
		newPassword: '',
		confirmPassword: ''
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
		if (!passwordInfoParse.success) {
			passwordFormErrors = passwordInfoParse.error.flatten().fieldErrors;
		}

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
			newPassword: passwordInputs.newPassword
		}).toPromise();

		loading = false;

		if (preHandleErrorOnGraphqlResult(result)) return;
		if (result.data?.passwordChange?.errors.length) {
			toastStore.send({
				message: result.data.passwordChange.errors[0].message as string,
				variant: 'error'
			});
			return;
		}
		toastStore.send({
			message: 'Update success',
			variant: 'success'
		});
	};
</script>

<div in:slide>
	<PasswordInput
		size="sm"
		class="mt-2"
		required
		placeholder="old password"
		label="Old password"
		bind:value={passwordInputs.oldPassword}
		showAction
		variant={passwordFormErrors.oldPassword?.length ? 'error' : 'info'}
		subText={passwordFormErrors.oldPassword?.length ? passwordFormErrors.oldPassword[0] : ''}
		onblur={passwordValidate}
		disabled={loading}
	/>
	<PasswordInput
		size="sm"
		class="mt-2"
		required
		placeholder="new password"
		label="New password"
		bind:value={passwordInputs.newPassword}
		showAction
		variant={passwordFormErrors.newPassword?.length ? 'error' : 'info'}
		subText={passwordFormErrors.newPassword?.length ? passwordFormErrors.newPassword[0] : ''}
		onblur={passwordValidate}
		disabled={loading}
	/>
	<PasswordInput
		size="sm"
		class="mt-2"
		required
		placeholder="confirm new password"
		label="Confirm new password"
		bind:value={passwordInputs.confirmPassword}
		variant={passwordFormErrors.confirmPassword?.length ? 'error' : 'info'}
		onblur={passwordValidate}
		disabled={loading}
		subText={passwordFormErrors.confirmPassword?.length
			? passwordFormErrors.confirmPassword[0]
			: ''}
	/>
</div>

<div class="text-right mt-4">
	<Button onclick={handleSubmit} {loading} disabled={loading || !passwordChanged}>Update</Button>
</div>
