<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PASSWORD_UPDATE_MUTATION } from '$lib/api/account';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { PasswordInput } from '$lib/components/ui/Input';
	import type { Mutation, MutationPasswordChangeArgs } from '$lib/gql/graphql';
	import { handleLogout } from '$lib/utils/auth.svelte';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { pick } from 'es-toolkit';
	import { object, string, z } from 'zod';

	const PasswordSchema = object({
		oldPassword: string().min(1, { message: $CommonState.FieldRequiredError }),
		newPassword: string().min(1, { message: $CommonState.FieldRequiredError }),
		confirmPassword: string().min(1, { message: $CommonState.FieldRequiredError }),
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
	const SchemaHandler = createSchemaHandler(PasswordSchema, () => passwordInputs);

	let passwordChanged = $derived(
		passwordInputs.oldPassword !== '' &&
			passwordInputs.newPassword !== '' &&
			passwordInputs.confirmPassword !== '' &&
			passwordInputs.newPassword === passwordInputs.confirmPassword,
	);

	const PasswordUpdateMutation = operationStore<
		Pick<Mutation, 'passwordChange'>,
		MutationPasswordChangeArgs
	>({
		query: PASSWORD_UPDATE_MUTATION,
		pause: true,
		onResult: async (result) => {
			if (
				checkIfGraphqlResultHasError(
					result,
					'passwordChange',
					$tranFunc('settings.passwordUpdated'),
				)
			)
				return;

			await handleLogout($tranFunc);
		},
	});

	const handleSubmit = async () => {
		if (SchemaHandler.validate())
			PasswordUpdateMutation.reexecute({
				variables: pick(passwordInputs, ['newPassword', 'oldPassword']),
			});
	};
</script>

<Accordion class={SitenameCommonClassName} open={false}>
	{#snippet header()}
		<SectionHeader>{$tranFunc('settings.pwdUpdate')}</SectionHeader>
	{/snippet}
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.oldPwd')}
		label={$tranFunc('settings.oldPwd')}
		bind:value={passwordInputs.oldPassword}
		showAction
		variant={$SchemaHandler.oldPassword?.length ? 'error' : 'info'}
		subText={$SchemaHandler.oldPassword?.[0]}
		onblur={SchemaHandler.validate}
		disabled={$PasswordUpdateMutation.fetching}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
	/>
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.newPwd')}
		label={$tranFunc('settings.newPwd')}
		bind:value={passwordInputs.newPassword}
		showAction
		variant={$SchemaHandler.newPassword?.length ? 'error' : 'info'}
		subText={$SchemaHandler.newPassword?.[0]}
		onblur={SchemaHandler.validate}
		disabled={$PasswordUpdateMutation.fetching}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
	/>
	<PasswordInput
		class="mt-2"
		required
		placeholder={$tranFunc('settings.confirmPwd')}
		label={$tranFunc('settings.confirmPwd')}
		bind:value={passwordInputs.confirmPassword}
		variant={$SchemaHandler.confirmPassword?.length ? 'error' : 'info'}
		onblur={SchemaHandler.validate}
		disabled={$PasswordUpdateMutation.fetching}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		subText={$SchemaHandler.confirmPassword?.[0]}
	/>

	<div class="text-right mt-4">
		<Button
			onclick={handleSubmit}
			loading={$PasswordUpdateMutation.fetching}
			disabled={$PasswordUpdateMutation.fetching || !passwordChanged}
		>
			{$tranFunc('btn.update')}
		</Button>
	</div>
</Accordion>
