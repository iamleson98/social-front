<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { Alert } from '$lib/components/ui/Alert';
	import { SUPPORTED_LANGUAGES, tranFunc } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import {
		CountryCode,
		LanguageCodeEnum,
		type Mutation,
		type MutationAccountRegisterArgs,
	} from '$lib/gql/graphql';
	import { USER_SIGNUP_MUTATION_STORE } from '$lib/api';
	import { clientSideGetCookieOrDefault, clientSideSetCookie } from '$lib/utils/cookies';
	import { CHANNEL_KEY, COUNTRY_CODE_KEY, LANGUAGE_KEY } from '$lib/utils/consts';
	import { PUBLIC_LOCAL_URL, PUBLIC_STORE_FRONT_URL } from '$env/static/public';
	import { omit } from 'es-toolkit';
	import { dev } from '$app/environment';
	import LanguageSelect from '$lib/components/common/country-language/language-select.svelte';
	import CountrySelect from '$lib/components/common/country-language/country-select.svelte';
	import { CHANNELS, DEFAULT_CHANNEL } from '$lib/utils/channels';
	import Location from '$lib/components/plugins/location.svelte';

	const CHANNEL_SLUG = clientSideGetCookieOrDefault(CHANNEL_KEY, DEFAULT_CHANNEL.slug);
	const DEFAULT_COUNTRY =
		CHANNELS.find((chan) => chan.slug === CHANNEL_SLUG)?.defaultCountryCode ||
		DEFAULT_CHANNEL.defaultCountryCode;
	const DEFAULT_LANGUAGE = clientSideGetCookieOrDefault(LANGUAGE_KEY, LanguageCodeEnum.En);

	let FIELD_REQUIRED_MSG = $tranFunc('helpText.fieldRequired');

	const SignupZodSchema = object({
		email: string()
			.nonempty(FIELD_REQUIRED_MSG)
			.email({ message: $tranFunc('error.invalidEmail') })
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
		termAndPoliciesAgree: boolean({ coerce: true }),
		redirectUrl: string().min(1, FIELD_REQUIRED_MSG),
		channel: string().min(1, FIELD_REQUIRED_MSG),
		languageCode: string(),
	})
		.refine((data) => data.password === data.confirmPassword, {
			message: $tranFunc('error.passwordsNotMatch'),
			path: ['confirmPassword'],
		})
		.refine((data) => !!data.termAndPoliciesAgree, {
			message: $tranFunc('error.doYouAgree'),
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
	let signupFormErrors = $state.raw<Partial<Record<keyof SignupProps, string[]>>>({});
	let signupQueryStore =
		$state<OperationResultStore<Pick<Mutation, 'accountRegister'>, MutationAccountRegisterArgs>>();

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

	const validateForm = () => {
		const parseResult = SignupZodSchema.safeParse(signupInfo);

		signupFormErrors = parseResult.success ? {} : parseResult.error.formErrors.fieldErrors;
		return parseResult.success;
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
				input: omit(signupInfo, ['confirmPassword', 'termAndPoliciesAgree']),
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
	<div class="mb-4">
		<div class="flex flex-row mobile-m:flex-col justify-between items-start gap-2 mb-2">
			<div class="w-1/2">
				<Input
					size="sm"
					type="text"
					placeholder={$tranFunc('common.firstName')}
					label={$tranFunc('common.firstName')}
					required
					disabled={$signupQueryStore?.fetching}
					bind:value={signupInfo.firstName}
					onblur={validateForm}
					variant={signupFormErrors?.firstName?.length ? 'error' : 'info'}
					subText={signupFormErrors?.firstName?.[0]}
					inputDebounceOption={{ onInput: validateForm }}
				/>
			</div>
			<div class="w-1/2">
				<Input
					size="sm"
					type="text"
					label={$tranFunc('common.lastName')}
					placeholder={$tranFunc('common.lastName')}
					required
					disabled={$signupQueryStore?.fetching}
					bind:value={signupInfo.lastName}
					onblur={validateForm}
					variant={signupFormErrors?.lastName?.length ? 'error' : 'info'}
					subText={signupFormErrors?.lastName?.[0]}
					inputDebounceOption={{ onInput: validateForm }}
				/>
			</div>
		</div>
		<Input
			size="sm"
			type="email"
			placeholder={$tranFunc('common.emailPlaceholder')}
			class="mb-2"
			required
			label={$tranFunc('common.email')}
			disabled={$signupQueryStore?.fetching}
			bind:value={signupInfo.email}
			startIcon={Email}
			onblur={validateForm}
			inputDebounceOption={{ onInput: validateForm }}
			variant={signupFormErrors?.email?.length ? 'error' : 'info'}
			subText={signupFormErrors?.email?.[0]}
		/>
		<PasswordInput
			size="sm"
			placeholder={$tranFunc('common.passwordPlaceholder')}
			bind:value={signupInfo.password}
			label={$tranFunc('common.password')}
			disabled={$signupQueryStore?.fetching}
			class="mb-2"
			variant={signupFormErrors?.password?.length ? 'error' : 'info'}
			subText={signupFormErrors?.password?.[0]}
			required
			showAction
			inputDebounceOption={{ onInput: validateForm }}
			onblur={validateForm}
		/>
		<PasswordInput
			size="sm"
			placeholder={$tranFunc('signup.confirmPasswordPlaceholder')}
			bind:value={signupInfo.confirmPassword}
			disabled={$signupQueryStore?.fetching}
			label={$tranFunc('common.confirmPwd')}
			class="mb-2"
			inputDebounceOption={{ onInput: validateForm }}
			showAction={false}
			variant={signupFormErrors?.confirmPassword?.length ? 'error' : 'info'}
			subText={signupFormErrors?.confirmPassword?.[0]}
			required
			onblur={validateForm}
		/>
		<div class="flex mb-2 items-start gap-2">
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

		<div class="mb-3">
			<Checkbox
				label={$tranFunc('signup.agreeToTerms')}
				bind:checked={signupInfo.termAndPoliciesAgree}
				required
				disabled={$signupQueryStore?.fetching}
				onchange={validateForm}
				size="sm"
				variant={signupFormErrors.termAndPoliciesAgree?.length ? 'error' : 'info'}
				subText={signupFormErrors.termAndPoliciesAgree?.[0]}
			/>
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
			<a href={AppRoute.AUTH_SIGNIN()} class="text-blue-600">{$tranFunc('signin.title')}</a>
		</span>
	</div>
</div>
