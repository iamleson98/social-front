<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';

	const statusCode = $derived(page.status || 500);
	const isNotFound = $derived(statusCode === 404);

	const errorTitle = $derived(isNotFound ? $T('error.pageNotFound') : $T('error.serverError'));
	const errorHint = $derived(
		isNotFound ? $T('error.pageNotFoundHint') : $T('error.serverErrorHint'),
	);
</script>

<div class="flex flex-col items-center justify-center py-24 px-4 text-center">
	<p class="text-7xl font-black text-blue-600">{statusCode}</p>
	<h1 class="text-xl font-semibold text-gray-700 mt-4">{errorTitle}</h1>
	<p class="text-sm text-gray-500 mt-2 max-w-md">
		{errorHint}
	</p>
	{#if page.error?.message && !isNotFound}
		<p class="text-xs text-gray-400 mt-1">{page.error.message}</p>
	{/if}

	<div class="flex gap-2 mt-8">
		<a href={AppRoute.HOME()}>
			<Button variant="filled" size="sm">{$T('error.backToHome')}</Button>
		</a>
		<a href={AppRoute.ME_SUPPORT()}>
			<Button variant="outline" size="sm">{$T('error.contactSupport')}</Button>
		</a>
	</div>
</div>
