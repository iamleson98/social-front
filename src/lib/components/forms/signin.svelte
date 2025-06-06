<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';
	import { Email } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { tranFunc } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import { Facebook, Twitter, Google } from '$lib/components/icons/SvgOuterIcon';
	import { boolean, object, string, z } from 'zod';
	import { setUserStoreValue } from '$lib/stores/auth/user';
	import { toast } from 'svelte-sonner';

	type Props = {
		onSuccess: () => void;
		hideSocial?: boolean;
	};

	let { onSuccess, hideSocial = false }: Props = $props();

	const EMAIL_MAX_LENGTH = 128;
	const PASSWORD_MAX_LENGTH = 128;

	const signinSchema = object({
		email: string()
			.nonempty({ message: $tranFunc('helpText.fieldRequired') })
			.email({ message: $tranFunc('error.invalidEmail') })
			.max(EMAIL_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('common.email'),
					min: 1,
					max: EMAIL_MAX_LENGTH,
				}),
			}),
		password: string()
			.nonempty({ message: $tranFunc('helpText.fieldRequired') })
			.max(PASSWORD_MAX_LENGTH, {
				message: $tranFunc('error.lengthInvalid', {
					name: $tranFunc('common.password'),
					min: 1,
					max: PASSWORD_MAX_LENGTH,
				}),
			}),
		rememberMe: boolean(),
	});

	type SigninSchema = z.infer<typeof signinSchema>;

	let signinValue = $state<SigninSchema>({
		email: '',
		password: '',
		rememberMe: false,
	});
	let signinFormErrors = $state.raw<Partial<Record<keyof SigninSchema, string[]>>>({});

	let loading = $state(false);
	let signinError = $state(null);

	const validateForm = () => {
		const parseResult = signinSchema.safeParse(signinValue);
		signinFormErrors = parseResult.success ? {} : parseResult.error.formErrors.fieldErrors;
		return parseResult.success;
	};

	const handleLogin = async () => {
		if (!validateForm()) return;

		loading = true;

		const loginResult = await fetch(AppRoute.AUTH_SIGNIN(), {
			method: 'POST',
			body: JSON.stringify(signinValue),
		})
			.then((res) => res.json())
			.catch(() => toast.error($tranFunc('error.errorOccured')));

		loading = false;

		if (loginResult.status !== HTTPStatusSuccess) {
			signinError = loginResult.error;
			return;
		}

		setUserStoreValue(loginResult.data);
		toast.success(
			$tranFunc('signin.welcomeBack', {
				name: loginResult.data.firstName + ' ' + loginResult.data.lastName,
			}),
		);

		onSuccess();
	};

	let socialIons = [
		{ text: 'Facebook', icon: Facebook },
		{ text: 'Twitter', icon: Twitter },
		{ text: 'Google', icon: Google },
	];
</script>

<div>
	<h1 class="p-2 mb-4">{$tranFunc('signin.title')}</h1>

	{#if signinError}
		<Alert variant="error" class="mb-3" size="sm" bordered>
			{signinError}
		</Alert>
	{/if}
	<div class="mb-3">
		<Input
			type="email"
			placeholder={$tranFunc('common.emailPlaceholder')}
			label={$tranFunc('common.email')}
			onblur={validateForm}
			inputDebounceOption={{ onInput: validateForm }}
			class="mb-2"
			bind:value={signinValue.email}
			required
			disabled={loading}
			startIcon={Email}
			variant={signinFormErrors?.email?.length ? 'error' : 'info'}
			subText={signinFormErrors?.email?.[0]}
		/>
		<PasswordInput
			placeholder={$tranFunc('common.passwordPlaceholder')}
			label={$tranFunc('common.password')}
			onblur={validateForm}
			inputDebounceOption={{ onInput: validateForm }}
			bind:value={signinValue.password}
			class="mb-1"
			disabled={loading}
			variant={signinFormErrors?.password?.length ? 'error' : 'info'}
			required
			showAction
			subText={signinFormErrors?.password?.[0]}
		/>
		<a href={AppRoute.AUTH_RESET_PASSWORD()} class="text-xs text-right block text-blue-600 mb-4">
			{$tranFunc('signin.forgotPassword')}
		</a>

		<Checkbox
			label={$tranFunc('signin.rememberMe')}
			size="sm"
			class="mb-3"
			bind:checked={signinValue.rememberMe}
			disabled={loading}
		/>

		<Button variant="filled" onclick={handleLogin} size="sm" fullWidth {loading}>
			{$tranFunc('signin.signinButton')}
		</Button>
	</div>

	<div class="mb-4">
		<span class="text-xs text-gray-500">
			{$tranFunc('signin.noAccount')}
			<a href={AppRoute.AUTH_REGISTER()} class="text-blue-600">{$tranFunc('signup.title')}</a>
		</span>
	</div>

	{#if !hideSocial}
		<div class="flex flex-row justify-between items-center">
			{#each socialIons as item, idx (idx)}
				<Button variant="outline" size="sm" disabled={loading}>
					<item.icon />
					{item.text}
				</Button>
			{/each}
		</div>
	{/if}
</div>
