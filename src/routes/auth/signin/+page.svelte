<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import {
		ClosedEye,
		Email,
		Facebook,
		Google,
		Icon,
		Lock,
		OpenEye,
		Twitter
	} from '$lib/components/icons';
	import { Alert } from '$lib/components/common';
	import { tClient } from '$lib/i18n';

	const passwordButtonIconsMap = {
		password: OpenEye,
		text: ClosedEye
	};

	let rememberCheck = $state(false);
	let passwordFieldType: 'text' | 'password' = $state('password');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let disabled = $derived(!email.trim() || !password || loading);

	interface Props {
		form: ActionData;
		data: PageData;
	}

	let { form, data }: Props = $props();

	const togglePasswordType = () =>
		(passwordFieldType = passwordFieldType === 'password' ? 'text' : 'password');

	const handlePasswordChange = (evt: any) => (password = evt.currentTarget.value);

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
		<Alert variant="error" content={form.error} classes="mb-3" />
	{/if}
	<form action="?/signin" method="post" onsubmit={handleFormSubmit} use:enhance>
		<!-- form main -->
		<div class="mb-3">
			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-3"
				for="email"
				class:input-error={form?.error}
			>
				<span>
					<Icon icon={Email} />
				</span>
				<input
					type="email"
					class="grow"
					name="email"
					id="email"
					placeholder={tClient('common.emailPlaceholder')}
					bind:value={email}
					required
					disabled={loading}
				/>
			</label>

			<label
				class="input input-md flex w-full input-bordered items-center gap-2 mb-1"
				for="password"
				class:input-error={form?.error}
			>
				<span>
					<Icon icon={Lock} />
				</span>
				<input
					type={passwordFieldType}
					name="password"
					class="grow"
					id="password"
					placeholder={tClient('common.passwordPlaceholder')}
					value={password}
					required
					disabled={loading}
					oninput={handlePasswordChange}
				/>
				<button type="button" class="btn btn-xs btn-circle" onclick={togglePasswordType}>
					<Icon icon={passwordButtonIconsMap[passwordFieldType]} />
				</button>
			</label>
			<a
				href={AppRoute.AUTH_RESET_PASSWORD}
				class="text-[10px] text-right block text-blue-600 mb-4"
			>
				{tClient('signin.forgotPassword')}
			</a>

			<label
				for="remember-me"
				class="text-xs text-gray-500 select-none mr-1 mb-5 flex items-center"
			>
				<span class="mr-2">{tClient('signin.rememberMe')}</span>
				<input
					type="checkbox"
					class="toggle toggle-xs toggle-info"
					id="remember-me"
					name="remember-me"
					bind:checked={rememberCheck}
				/>
			</label>

			<Button variant="filled" type="submit" size="sm" fullWidth bind:loading {disabled}
				>{tClient('signin.signinButton')}</Button
			>
		</div>

		<div>
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
