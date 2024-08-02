<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert } from '$lib/components/common';
	import { Email, Icon } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import {
		HTTPStatusBadRequest,
		HTTPStatusServerError,
		HTTPStatusSuccess
	} from '$lib/utils/consts';
	import type { ActionData } from './$types';
	import { tClient } from '$lib/i18n';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let email = $state('');
	let loading = $state(false);
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('resetPassword.title')}</h1>

	{#if form && form?.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<Alert content={form?.error} variant="error" classes="mb-3" />
	{:else if form && form?.status === HTTPStatusSuccess}
		<Alert content={form?.data} variant="info" classes="mb-3" />
	{/if}

	<form action="?/request_password_reset" method="post" use:enhance>
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
				name="email"
				class="grow"
				id="email"
				placeholder={tClient('common.emailPlaceholder')}
				bind:value={email}
				required
				disabled={loading}
			/>
		</label>
		<Button
			variant="filled"
			size="sm"
			fullWidth
			type="submit"
			disabled={loading || !email.trim()}
			bind:loading
		>
			{tClient('resetPassword.btnText')}
		</Button>
	</form>
</div>
