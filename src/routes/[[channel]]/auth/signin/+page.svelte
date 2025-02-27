<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Signin from '$lib/components/forms/signin.svelte';
	import { AppRoute } from '$lib/utils';

	const onSuccess = async () => {
		const next = page.url.searchParams.get('next');
		await goto(next ? decodeURIComponent(next) : AppRoute.HOME, { invalidateAll: true });
	};
</script>

<div class="w-md rounded-md p-2">
	<Signin {onSuccess} />
</div>
