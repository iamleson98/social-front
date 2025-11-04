<script lang="ts">
	import { dev } from '$app/environment';
	import { PUBLIC_LOCAL_URL, PUBLIC_STORE_FRONT_URL } from '$env/static/public';
	import { USER_SIGNUP_MUTATION_STORE } from '$lib/api';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import CountrySelect from '$lib/components/common/country-language/country-select.svelte';
	import LanguageSelect from '$lib/components/common/country-language/language-select.svelte';
	import { Email } from '$lib/components/icons';
	import Location from '$lib/components/plugins/location.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import {
		CountryCode,
		LanguageCodeEnum,
		type AccountRegisterInput,
		type Mutation,
		type MutationAccountRegisterArgs,
	} from '$lib/gql/graphql';
	import { SUPPORTED_LANGUAGES, tranFunc } from '$lib/i18n';
	import { AppRoute } from '$lib/utils';
	import { CHANNELS, DEFAULT_CHANNEL } from '$lib/utils/consts';
	import { CHANNEL_KEY, COUNTRY_CODE_KEY, LANGUAGE_KEY } from '$lib/utils/consts';
	import { clientSideGetCookieOrDefault, clientSideSetCookie } from '$lib/utils/cookies';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { omit } from 'es-toolkit';
	import { boolean, email, object, string, z } from 'zod';

	const CHANNEL_SLUG = clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug);
	const DEFAULT_COUNTRY =
		CHANNELS.find((chan) => chan.slug === CHANNEL_SLUG)?.defaultCountryCode ||
		DEFAULT_CHANNEL.defaultCountryCode;
	const DEFAULT_LANGUAGE = clientSideGetCookieOrDefault(LANGUAGE_KEY, LanguageCodeEnum.En);

	let FIELD_REQUIRED_MSG = $tranFunc('helpText.fieldRequired');

	const SignupZodSchema = object({
		email: email({ message: $tranFunc('error.invalidEmail') })
			.nonempty(FIELD_REQUIRED_MSG)
			.max(128, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('common.email'),
					max: 128,
					min: 1,
				}),
			}),
		password: string().nonempty(FIELD_REQUIRED_MSG),
		firstName: string().nonempty(FIELD_REQUIRED_MSG),
		lastName: string().nonempty(FIELD_REQUIRED_MSG),
		confirmPassword: string().nonempty(FIELD_REQUIRED_MSG),
		termAndPoliciesAgree: boolean(),
		redirectUrl: string().min(1, FIELD_REQUIRED_MSG),
		channel: string().min(1, FIELD_REQUIRED_MSG),
		languageCode: string(),
	})
		.refine((data) => data.password === data.confirmPassword, {
			error: $tranFunc('error.passwordsNotMatch'),
			path: ['confirmPassword'],
		})
		.refine((data) => !!data.termAndPoliciesAgree, {
			error: $tranFunc('error.doYouAgree'),
			path: ['termAndPoliciesAgree'],
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
		termAndPoliciesAgree: false,
		languageCode: DEFAULT_LANGUAGE,
	});
	let countryCode = $state<CountryCode>(DEFAULT_COUNTRY);
	let signupQueryStore =
		$state<OperationResultStore<Pick<Mutation, 'accountRegister'>, MutationAccountRegisterArgs>>();

	const SchemaHandler = createSchemaHandler(SignupZodSchema, () => signupInfo);

	$effect(() => {
		if (countryCode) {
			const chan = CHANNELS.find((chan) => chan.defaultCountryCode === countryCode);

			if (chan) {
				signupInfo.channel = chan.slug;
				clientSideSetCookie(CHANNEL_KEY, chan.slug, {
					secure: true,
					expires: new Date(3000, 1, 1),
					path: '/',
				});
				clientSideSetCookie(COUNTRY_CODE_KEY, countryCode, {
					secure: true,
					expires: new Date(3000, 1, 1),
					path: '/',
				});
				return;
			}

			signupInfo.channel = DEFAULT_CHANNEL.slug;
		}
	});

	$effect(() => {
		if (signupInfo.languageCode && signupInfo.languageCode !== DEFAULT_LANGUAGE) {
			if (SUPPORTED_LANGUAGES.some((lang) => lang.code === signupInfo.languageCode)) {
				clientSideSetCookie(LANGUAGE_KEY, signupInfo.languageCode, {
					secure: true,
					expires: new Date(3000, 1, 1),
					path: '/',
				});
			}
		}
	});

	const handleSignup = async () => {
		if (!SchemaHandler.validate()) return;

		signupQueryStore = operationStore<
			Pick<Mutation, 'accountRegister'>,
			MutationAccountRegisterArgs
		>({
			query: USER_SIGNUP_MUTATION_STORE,
			variables: {
				input: omit(signupInfo, [
					'confirmPassword',
					'termAndPoliciesAgree',
				]) as AccountRegisterInput,
			},
		});
	};
</script>

<Location forceAskLocation />

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
	<Alert class="mb-2" dismissable size="sm" bordered>{$tranFunc('signup.promtGeoAccessPerm')}</Alert
	>
	<div class="mb-4 space-y-2">
		<div class="flex flex-row mobile-m:flex-col justify-between items-start gap-2">
			<Input
				size="sm"
				type="text"
				class="w-1/2"
				placeholder={$tranFunc('common.firstName')}
				label={$tranFunc('common.firstName')}
				required
				disabled={$signupQueryStore?.fetching}
				bind:value={signupInfo.firstName}
				onblur={SchemaHandler.validate}
				variant={$SchemaHandler?.firstName?.length ? 'error' : 'info'}
				subText={$SchemaHandler?.firstName?.[0]}
				inputDebounceOption={{ onInput: SchemaHandler.validate }}
			/>
			<Input
				size="sm"
				type="text"
				class="w-1/2"
				label={$tranFunc('common.lastName')}
				placeholder={$tranFunc('common.lastName')}
				required
				disabled={$signupQueryStore?.fetching}
				bind:value={signupInfo.lastName}
				onblur={SchemaHandler.validate}
				variant={$SchemaHandler?.lastName?.length ? 'error' : 'info'}
				subText={$SchemaHandler?.lastName?.[0]}
				inputDebounceOption={{ onInput: SchemaHandler.validate }}
			/>
		</div>
		<Input
			size="sm"
			type="email"
			placeholder={$tranFunc('common.emailPlaceholder')}
			required
			label={$tranFunc('common.email')}
			disabled={$signupQueryStore?.fetching}
			bind:value={signupInfo.email}
			startIcon={Email}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler?.email?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.email?.[0]}
		/>
		<PasswordInput
			size="sm"
			placeholder={$tranFunc('common.passwordPlaceholder')}
			bind:value={signupInfo.password}
			label={$tranFunc('common.password')}
			disabled={$signupQueryStore?.fetching}
			variant={$SchemaHandler?.password?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.password?.[0]}
			required
			showAction
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
		/>
		<PasswordInput
			size="sm"
			placeholder={$tranFunc('signup.confirmPasswordPlaceholder')}
			bind:value={signupInfo.confirmPassword}
			disabled={$signupQueryStore?.fetching}
			label={$tranFunc('common.confirmPwd')}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			showAction={false}
			variant={$SchemaHandler?.confirmPassword?.length ? 'error' : 'info'}
			subText={$SchemaHandler?.confirmPassword?.[0]}
			required
			onblur={SchemaHandler.validate}
		/>
		<div class="flex items-start gap-2">
			<CountrySelect
				size="sm"
				class="w-1/2"
				bind:value={countryCode}
				label={$tranFunc('common.country')}
			/>
			<LanguageSelect
				size="sm"
				class="w-1/2"
				autoDefault
				bind:value={signupInfo.languageCode}
				label={$tranFunc('footer.language')}
			/>
		</div>

		<Checkbox
			label={$tranFunc('signup.agreeToTerms')}
			bind:checked={signupInfo.termAndPoliciesAgree}
			required
			disabled={$signupQueryStore?.fetching}
			onchange={SchemaHandler.validate}
			size="sm"
			variant={$SchemaHandler.termAndPoliciesAgree?.length ? 'error' : 'info'}
			subText={$SchemaHandler.termAndPoliciesAgree?.[0]}
		/>

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
			<a href={AppRoute.AUTH_SIGNIN()} class="text-blue-600">{$tranFunc('signin.title')}</a>
		</span>
	</div>
</div>
