<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import { Email, Facebook, Google, Icon, Twitter } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { tClient } from '$lib/i18n';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';

	let rememberCheck = $state(false);
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let disabled = $derived.by(() => !email.trim() || !password || loading);

	interface Props {
		form: ActionData;
		data: PageData;
	}

	let { form, data }: Props = $props();

	const handleFormSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		loading = true;

		const target = event.currentTarget as HTMLFormElement;

		const response = await fetch(target.action, {
			method: target.method,
			body: new FormData(target)
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			await invalidateAll();
		}

		applyAction(result);

		loading = false;
	};
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('signin.title')}</h1>

	{#if form && form.error}
		<Alert variant="error" class="mb-3" size="xs" bordered>
			{form.error}
		</Alert>
	{/if}
	<form action="?/signin" method="post" onsubmit={handleFormSubmit} use:enhance>
		<!-- form main -->
		<div class="mb-3">
			<Input
				type="email"
				name="email"
				id="email"
				placeholder={tClient('common.emailPlaceholder')}
				class="mb-2"
				bind:value={email}
				required
				disabled={loading}
				startIcon={Email}
			/>
			<PasswordInput
				placeholder={tClient('common.passwordPlaceholder')}
				bind:value={password}
				class="mb-1"
				name="password"
			/>
			<a
				href={AppRoute.AUTH_RESET_PASSWORD}
				class="text-[10px] text-right block text-blue-600 mb-4"
			>
				{tClient('signin.forgotPassword')}
			</a>

			<Checkbox
				label={tClient('signin.rememberMe')}
				name="remember-me"
				class="mb-3"
				bind:checked={rememberCheck}
			/>

			<Button variant="filled" type="submit" size="sm" fullWidth {loading} {disabled}>
				{tClient('signin.signinButton')}
			</Button>
		</div>

		<div class="mb-4">
			<span class="text-xs text-gray-500">
				{tClient('signin.noAccount')}
				<a href={AppRoute.AUTH_REGISTER} class="text-blue-600">{tClient('signup.title')}</a>
			</span>
		</div>
	</form>

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
</div>
