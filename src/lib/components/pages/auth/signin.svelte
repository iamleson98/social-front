<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Facebook, Twitter, Google } from '$lib/components/icons/SvgOuterIcon';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { T } from '$lib/i18n';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { AppRoute } from '$lib/utils';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { toast } from 'svelte-sonner';
	import { boolean, object, string, z } from 'zod';

	type Props = {
		onSuccess: () => void;
		hideSocial?: boolean;
	};

	let { onSuccess, hideSocial = false }: Props = $props();

	const EMAIL_MAX_LENGTH = 128;
	const PASSWORD_MAX_LENGTH = 128;

	const signinSchema = object({
		email: string()
			.nonempty({ message: $T('helpText.fieldRequired') })
			.email({ message: $T('error.invalidEmail') })
			.max(EMAIL_MAX_LENGTH, {
				message: $T('error.lengthInvalid', {
					name: $T('common.email'),
					min: 1,
					max: EMAIL_MAX_LENGTH,
				}),
			}),
		password: string()
			.nonempty({ message: $T('helpText.fieldRequired') })
			.max(PASSWORD_MAX_LENGTH, {
				message: $T('error.lengthInvalid', {
					name: $T('common.password'),
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

	let loading = $state(false);
	let signinError = $state(null);

	const SchemaValidator = createSchemaHandler(signinSchema, () => signinValue);

	const handleLogin = async () => {
		if (!SchemaValidator.validate()) return;

		loading = true;

		const loginResult = await fetch(AppRoute.AUTH_SIGNIN(), {
			method: 'POST',
			body: JSON.stringify(signinValue),
		})
			.then((res) => res.json())
			.catch(() => toast.error($T('error.errorOccured')));

		loading = false;

		if (loginResult.status !== HTTPStatusSuccess) {
			signinError = loginResult.error;
			return;
		}

		UserStoreManager.setValue(loginResult.data);
		toast.success(
			$T('signin.welcomeBack', {
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
	<h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-1">{$T('signin.title')}</h1>
	<p class="text-sm text-gray-500 mb-6">{$T('signin.subtitle')}</p>

	{#if signinError}
		<Alert variant="error" class="mb-4" size="sm" bordered>
			{signinError}
		</Alert>
	{/if}
	<div class="mb-4">
		<Input
			type="email"
			placeholder={$T('common.emailPlaceholder')}
			label={$T('common.email')}
			onblur={SchemaValidator.validate}
			inputDebounceOption={{ onInput: SchemaValidator.validate }}
			class="mb-3"
			bind:value={signinValue.email}
			required
			disabled={loading}
			startIcon={Email}
			variant={$SchemaValidator?.email?.length ? 'error' : 'info'}
			subText={$SchemaValidator?.email?.[0]}
		/>
		<PasswordInput
			placeholder={$T('common.passwordPlaceholder')}
			label={$T('common.password')}
			onblur={SchemaValidator.validate}
			inputDebounceOption={{ onInput: SchemaValidator.validate }}
			bind:value={signinValue.password}
			class="mb-2"
			disabled={loading}
			variant={$SchemaValidator?.password?.length ? 'error' : 'info'}
			required
			showAction
			subText={$SchemaValidator?.password?.[0]}
		/>
		<div class="flex items-center justify-between">
			<Checkbox
				label={$T('signin.rememberMe')}
				size="sm"
				bind:checked={signinValue.rememberMe}
				disabled={loading}
			/>
			<a
				href={AppRoute.AUTH_RESET_PASSWORD()}
				class="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
			>
				{$T('signin.forgotPassword')}
			</a>
		</div>

		<Button variant="filled" onclick={handleLogin} size="md" fullWidth {loading} class="mt-4">
			{$T('signin.signinButton')}
		</Button>
	</div>

	<div class="mb-5 text-center">
		<span class="text-sm text-gray-500">
			{$T('signin.noAccount')}
			<a
				href={AppRoute.AUTH_REGISTER()}
				class="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
			>
				{$T('signup.title')}
			</a>
		</span>
	</div>

	{#if !hideSocial}
		<div class="relative mb-4">
			<div class="absolute inset-0 flex items-center" aria-hidden="true">
				<div class="w-full border-t border-gray-200"></div>
			</div>
			<div class="relative flex justify-center">
				<span class="bg-white px-4 text-xs text-gray-400">{$T('auth.orContinueWith')}</span>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-2">
			{#each socialIons as item, idx (idx)}
				<Button variant="outline" size="sm" disabled={loading} class="justify-center">
					<item.icon />
					<span class="max-tablet:hidden">{item.text}</span>
				</Button>
			{/each}
		</div>
	{/if}
</div>
