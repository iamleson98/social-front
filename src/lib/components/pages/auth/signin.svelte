<script lang="ts">
	import { Email } from '$lib/components/icons';
	import { Facebook, Twitter, Google } from '$lib/components/icons/SvgOuterIcon';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { T } from '$lib/i18n';
	import { UserStoreManager } from '$lib/stores/auth/user';
	import { AppRoute } from '$lib/utils';
	import { BackendHttpClient } from '$lib/utils/api';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import toast from 'svelte-french-toast';
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

		try {
			const result = await BackendHttpClient.login(signinValue.email, signinValue.password);
			if (result) {
				UserStoreManager.setValue(result);
				toast.success(
					$T('signin.welcomeBack', {
						name: result.username,
					}),
				);

				onSuccess();
			}
		} catch (error) {
			toast.error($T('error.errorOccured'));
			return;
		} finally {
			loading = false;
		}
	};

	let socialIons = [
		{ text: 'Facebook', icon: Facebook },
		{ text: 'Twitter', icon: Twitter },
		{ text: 'Google', icon: Google },
	];
</script>

<div>
	<h1 class="p-2 mb-4">{$T('signin.title')}</h1>

	{#if signinError}
		<Alert variant="error" class="mb-3" size="sm" bordered>
			{signinError}
		</Alert>
	{/if}
	<div class="mb-3">
		<Input
			type="email"
			placeholder={$T('common.emailPlaceholder')}
			label={$T('common.email')}
			onblur={SchemaValidator.validate}
			inputDebounceOption={{ onInput: SchemaValidator.validate }}
			class="mb-2"
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
			class="mb-1"
			disabled={loading}
			variant={$SchemaValidator?.password?.length ? 'error' : 'info'}
			required
			showAction
			subText={$SchemaValidator?.password?.[0]}
		/>
		<a href={AppRoute.AUTH_RESET_PASSWORD()} class="text-xs text-right block text-blue-600 mb-4">
			{$T('signin.forgotPassword')}
		</a>

		<Checkbox
			label={$T('signin.rememberMe')}
			size="sm"
			class="mb-3"
			bind:checked={signinValue.rememberMe}
			disabled={loading}
		/>

		<Button variant="filled" onclick={handleLogin} size="sm" fullWidth {loading}>
			{$T('signin.signinButton')}
		</Button>
	</div>

	<div class="mb-4">
		<span class="text-xs text-gray-500">
			{$T('signin.noAccount')}
			<a href={AppRoute.AUTH_REGISTER()} class="text-blue-600">{$T('signup.title')}</a>
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
