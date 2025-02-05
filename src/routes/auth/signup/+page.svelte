<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { tranFunc } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { z } from 'zod';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import type { Mutation, MutationAccountRegisterArgs } from '$lib/gql/graphql';
	import { USER_SIGNUP_MUTATION_STORE } from '$lib/api';

	const SignupZodSchema = z
		.object({
			email: z
				.string()
				.email({ message: 'invalid email' })
				.nonempty({ message: 'email is required' }),
			password: z.string().nonempty({ message: 'password is required' }),
			firstName: z.string().nonempty({ message: 'first name is required' }),
			lastName: z.string().nonempty({ message: 'last name is required' }),
			confirmPassword: z.string().nonempty({ message: 'confirm password is required' }),
			termAndPoliciesAgree: z.boolean({ coerce: true }).default(false)
		})
		.refine((data) => data.password === data.confirmPassword, {
			message: 'passwords do not match',
			path: ['confirmPassword']
		})
		.innerType();

	type SignupProps = z.infer<typeof SignupZodSchema>;

	let signupInfo = $state<Partial<SignupProps>>({});
	let signupErrors = $state.raw<Partial<Record<keyof SignupProps, string>>>({});

	let signupQueryStore: OperationResultStore<unknown>;

	const handleSignup = async () => {
		const parseResult = SignupZodSchema.safeParse(signupInfo);

		if (!parseResult.success) {
			console.log(parseResult.error?.formErrors);
			// signupErrors = parseResult.error?.formErrors;
			return;
		}

		signupQueryStore = operationStore<
			Pick<Mutation, 'accountRegister'>,
			MutationAccountRegisterArgs
		>({
			kind: 'mutation',
			query: USER_SIGNUP_MUTATION_STORE,
			variables: {}
		});
	};

	let passwordDontMatch = $derived(signupInfo.password !== signupInfo.confirmPassword);
	let signupButtonDisabled = $derived(
		$signupQueryStore?.fetching ||
			!signupInfo.firstName?.trim() ||
			!signupInfo.lastName?.trim() ||
			!signupInfo.email?.trim() ||
			!signupInfo.password ||
			!signupInfo.confirmPassword ||
			!signupInfo.termAndPoliciesAgree
	);
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('signup.title')}</h1>

	{#if $signupQueryStore?.error}
		<Alert variant="error" class="mb-3" bordered>
			{$signupQueryStore.error.message}
		</Alert>
	{/if}
	<div class="mb-4">
		<div class="flex flex-row mobile-m:flex-col justify-between items-center gap-2 mb-2">
			<Input
				type="text"
				placeholder={$tranFunc('common.firstName')}
				required
				disabled={$signupQueryStore?.fetching}
				bind:value={signupInfo.firstName}
			/>
			<Input
				type="text"
				placeholder={$tranFunc('common.lastName')}
				required
				disabled={$signupQueryStore?.fetching}
				bind:value={signupInfo.lastName}
			/>
		</div>
		<Input
			type="text"
			placeholder={$tranFunc('common.emailPlaceholder')}
			class="mb-2"
			required
			disabled={$signupQueryStore?.fetching}
			bind:value={signupInfo.email}
			startIcon={Email}
		/>
		<PasswordInput
			placeholder={$tranFunc('common.passwordPlaceholder')}
			bind:value={signupInfo.password}
			disabled={$signupQueryStore?.fetching}
			class="mb-2"
			variant={passwordDontMatch ? 'error' : 'info'}
			required
			showAction
		/>
		<PasswordInput
			placeholder={$tranFunc('signup.confirmPasswordPlaceholder')}
			bind:value={signupInfo.confirmPassword}
			disabled={$signupQueryStore?.fetching}
			class="mb-3"
			showAction={false}
			variant={passwordDontMatch ? 'error' : 'info'}
			required
		/>

		<Checkbox
			label={$tranFunc('signup.agreeToTerms')}
			class="mb-3"
			bind:checked={signupInfo.termAndPoliciesAgree}
			required
			disabled={$signupQueryStore?.fetching}
			size="sm"
		/>

		<Button
			variant="filled"
			type="submit"
			size="sm"
			fullWidth
			disabled={signupButtonDisabled}
			onclick={handleSignup}
		>
			{$tranFunc('signup.signupButton')}
		</Button>
	</div>

	<div>
		<span class="text-xs text-gray-500">
			{$tranFunc('signup.alreadyHasAccount')}
			<a href={AppRoute.AUTH_SIGNIN} class="text-blue-600">{$tranFunc('signin.title')}</a>
		</span>
	</div>
</div>
