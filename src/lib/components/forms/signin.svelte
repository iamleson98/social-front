<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { Email, Facebook, Google, Icon, Twitter } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import { HTTPStatusSuccess } from '$lib/utils/consts';
	import { toastStore } from '$lib/stores/ui/toast';

	type Props = {
		onSuccess: () => void;
		hideSocial?: boolean;
	};

	let { onSuccess, hideSocial = false }: Props = $props();

	let rememberCheck = $state(false);
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let disabled = $derived.by(() => !email.trim() || !password || loading);
	let error = $state(null);

	const handleLogin = async () => {
		loading = true;

		const loginResult = await fetch(AppRoute.AUTH_SIGNIN, {
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
				rememberMe: rememberCheck
			})
		}).then((res) => res.json());

		loading = false;

		if (loginResult.status !== HTTPStatusSuccess) {
			error = loginResult.error;
			return;
		}

		userStore.set(loginResult.data);
		toastStore.send({
			message: tClient('signin.welcomeBack', {
				name: loginResult.data.firstName + ' ' + loginResult.data.lastName
			}),
			variant: 'success'
		});

		onSuccess();
	};
</script>

<div>
	<h1 class="p-2 mb-4">{tClient('signin.title')}</h1>

	{#if error}
		<Alert variant="error" class="mb-3" size="sm" bordered>
			{error}
		</Alert>
	{/if}
	<div class="mb-3">
		<Input
			type="email"
			placeholder={tClient('common.emailPlaceholder')}
			class="mb-2"
			bind:value={email}
			required
			disabled={loading}
			startIcon={Email}
			variant={error ? 'error' : 'info'}
		/>
		<PasswordInput
			placeholder={tClient('common.passwordPlaceholder')}
			bind:value={password}
			class="mb-1"
			variant={error ? 'error' : 'info'}
			required
			showAction
		/>
		<a href={AppRoute.AUTH_RESET_PASSWORD} class="text-xs text-right block text-blue-600 mb-4">
			{tClient('signin.forgotPassword')}
		</a>

		<Checkbox label={tClient('signin.rememberMe')} size="sm" class="mb-3" bind:checked={rememberCheck} />

		<Button variant="filled" onclick={handleLogin} size="sm" fullWidth {loading} {disabled}>
			{tClient('signin.signinButton')}
		</Button>
	</div>

	<div class="mb-4">
		<span class="text-xs text-gray-500">
			{tClient('signin.noAccount')}
			<a href={AppRoute.AUTH_REGISTER} class="text-blue-600">{tClient('signup.title')}</a>
		</span>
	</div>

	{#if !hideSocial}
		<div class="flex flex-row justify-between items-center">
			<Button>
				<Icon icon={Facebook} />
			</Button>
			<Button>
				<Icon icon={Google} />
			</Button>
			<Button>
				<Icon icon={Twitter} />
			</Button>
		</div>
	{/if}
</div>
