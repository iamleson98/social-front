<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { tranFunc } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import type { Mutation, MutationAccountRegisterArgs } from '$lib/gql/graphql';
	import { USER_SIGNUP_MUTATION_STORE } from '$lib/api';
	import { clientSideGetCookieOrDefault } from '$lib/utils/cookies';
	import { CHANNEL_KEY, defaultChannel } from '$lib/utils/consts';
	import { PUBLIC_LOCAL_URL, PUBLIC_STORE_FRONT_URL } from '$env/static/public';
	import { omit } from 'lodash-es';
	import { slide } from 'svelte/transition';
	import { dev } from '$app/environment';

	const CHANNEL_SLUG = clientSideGetCookieOrDefault(CHANNEL_KEY, defaultChannel.slug);

	const SignupZodSchema = object({
		email: string()
			.nonempty({ message: $tranFunc('helpText.fieldRequired') })
			.email({ message: $tranFunc('error.invalidEmail') })
			.max(128, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('common.email'),
					max: 128,
					min: 1
				})
			}),
		password: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		firstName: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		lastName: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		confirmPassword: string().nonempty({ message: $tranFunc('helpText.fieldRequired') }),
		termAndPoliciesAgree: boolean({ coerce: true }),
		redirectUrl: string().min(1, { message: $tranFunc('helpText.fieldRequired') }),
		channel: string().min(1, { message: $tranFunc('helpText.fieldRequired') })
	})
		.refine((data) => data.password === data.confirmPassword, {
			message: $tranFunc('error.passwordsNotMatch'),
			path: ['confirmPassword']
		})
		.refine((data) => !!data.termAndPoliciesAgree, {
			message: $tranFunc('error.doYouAgree'),
			path: ['termAndPoliciesAgree']
		});

	type SignupProps = z.infer<typeof SignupZodSchema>;

	let signupInfo = $state<SignupProps>({
		redirectUrl: dev ? PUBLIC_LOCAL_URL : PUBLIC_STORE_FRONT_URL,
		channel: CHANNEL_SLUG,
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		confirmPassword: '',
		termAndPoliciesAgree: false
	});
	let signupFormErrors = $state.raw<Partial<Record<keyof SignupProps, string[]>>>({});
	let signupQueryStore =
		$state<OperationResultStore<Pick<Mutation, 'accountRegister'>, MutationAccountRegisterArgs>>();

	const validateForm = () => {
		const parseResult = SignupZodSchema.safeParse(signupInfo);

		if (!parseResult.success) {
			signupFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}

		signupFormErrors = {};
		return true;
	};

	const handleSignup = async () => {
		if (!validateForm()) return;

		signupQueryStore = operationStore<
			Pick<Mutation, 'accountRegister'>,
			MutationAccountRegisterArgs
		>({
			kind: 'mutation',
			query: USER_SIGNUP_MUTATION_STORE,
			variables: {
				input: omit(signupInfo, ['confirmPassword', 'termAndPoliciesAgree'])
			},
			context: {
				requestPolicy: 'network-only'
			}
		});
	};
</script>

<div class="w-md rounded-md p-2">
	<h1 class="p-2 mb-4">{$tranFunc('signup.title')}</h1>

	{#if $signupQueryStore?.error}
		<Alert variant="error" class="mb-3" bordered size="sm">
			{$signupQueryStore.error.message}
		</Alert>
	{:else if $signupQueryStore?.data?.accountRegister?.errors.length}
		<Alert variant="error" class="mb-3" bordered size="sm">
			{$signupQueryStore.data.accountRegister.errors[0].message}
		</Alert>
	{:else if $signupQueryStore?.data?.accountRegister?.user}
		<Alert variant="success" class="mb-3" bordered size="sm">
			{$tranFunc('signup.signupSuccess')}
		</Alert>
	{/if}
	<div class="mb-4">
		<div class="flex flex-row mobile-m:flex-col justify-between items-start gap-2 mb-2">
			<div class="w-1/2">
				<Input
					type="text"
					placeholder={$tranFunc('common.firstName')}
					required
					disabled={$signupQueryStore?.fetching}
					bind:value={signupInfo.firstName}
					onblur={validateForm}
					variant={signupFormErrors?.firstName?.length ? 'error' : 'info'}
					subText={signupFormErrors?.firstName?.length ? signupFormErrors.firstName[0] : ''}
				/>
			</div>
			<div class="w-1/2">
				<Input
					type="text"
					placeholder={$tranFunc('common.lastName')}
					required
					disabled={$signupQueryStore?.fetching}
					bind:value={signupInfo.lastName}
					onblur={validateForm}
					variant={signupFormErrors?.lastName?.length ? 'error' : 'info'}
					subText={signupFormErrors?.lastName?.length ? signupFormErrors.lastName[0] : ''}
				/>
			</div>
		</div>
		<Input
			type="text"
			placeholder={$tranFunc('common.emailPlaceholder')}
			class="mb-2"
			required
			disabled={$signupQueryStore?.fetching}
			bind:value={signupInfo.email}
			startIcon={Email}
			onblur={validateForm}
			variant={signupFormErrors?.email?.length ? 'error' : 'info'}
			subText={signupFormErrors?.email?.length ? signupFormErrors.email[0] : ''}
		/>
		<PasswordInput
			placeholder={$tranFunc('common.passwordPlaceholder')}
			bind:value={signupInfo.password}
			disabled={$signupQueryStore?.fetching}
			class="mb-2"
			variant={signupFormErrors?.password?.length ? 'error' : 'info'}
			subText={signupFormErrors?.password?.length ? signupFormErrors.password[0] : ''}
			required
			showAction
			onblur={validateForm}
		/>
		<PasswordInput
			placeholder={$tranFunc('signup.confirmPasswordPlaceholder')}
			bind:value={signupInfo.confirmPassword}
			disabled={$signupQueryStore?.fetching}
			class="mb-3"
			showAction={false}
			variant={signupFormErrors?.confirmPassword?.length ? 'error' : 'info'}
			subText={signupFormErrors?.confirmPassword?.length ? signupFormErrors.confirmPassword[0] : ''}
			required
			onblur={validateForm}
		/>

		<div class="mb-3">
			<Checkbox
				label={$tranFunc('signup.agreeToTerms')}
				bind:checked={signupInfo.termAndPoliciesAgree}
				required
				disabled={$signupQueryStore?.fetching}
				onchange={validateForm}
				size="sm"
			/>
			{#if signupFormErrors?.termAndPoliciesAgree?.length}
				<div class="text-xs text-red-600" transition:slide>
					{signupFormErrors.termAndPoliciesAgree[0]}
				</div>
			{/if}
		</div>

		<Button
			variant="filled"
			type="submit"
			size="sm"
			fullWidth
			onclick={handleSignup}
			loading={$signupQueryStore?.fetching}
			disabled={$signupQueryStore?.fetching}
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
