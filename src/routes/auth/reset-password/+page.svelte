<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert } from '$lib/components/ui/Alert';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import {
		HTTPStatusBadRequest,
		HTTPStatusServerError,
		HTTPStatusSuccess
	} from '$lib/utils/consts';
	import type { ActionData } from './$types';
	import { tClient } from '$lib/i18n';
	import { Input } from '$lib/components/ui/Input';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let email = $state('');
	let loading = $state(false);
	let disabled = $derived.by(() => !email.trim() || loading);
</script>

<div class="max-w-md min-w-80 rounded-md p-2">
	<h1 class="p-2 mb-4">{tClient('resetPassword.title')}</h1>

	{#if form && form?.status && [HTTPStatusBadRequest, HTTPStatusServerError].includes(form.status)}
		<Alert variant="error" class="mb-3">
			{form.error}
		</Alert>
	{:else if form && form?.status === HTTPStatusSuccess}
		<Alert variant="success" class="mb-3">
			{form.data}
		</Alert>
	{/if}

	<form action="?/request_password_reset" method="post" use:enhance>
		<Input
			type="email"
			name="email"
			id="email"
			placeholder={tClient('common.emailPlaceholder')}
			bind:value={email}
			required
			disabled={loading}
			startIcon={Email}
			class="mb-2"
		/>
		<Button variant="filled" size="sm" fullWidth type="submit" {disabled} {loading}>
			{tClient('resetPassword.btnText')}
		</Button>
	</form>
</div>
