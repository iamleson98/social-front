<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components/common';
	import { Toast } from '$lib/components/ui/Toast';
	import { toastStore } from '$lib/stores/ui/toast';
	import type { LayoutData } from './$types';
	import { userStore } from '$lib/stores/auth';
	import type { User } from '$lib/gql/graphql';
	import { HTTPStatusServerError } from '$lib/utils/types';

	export let data: LayoutData;

	$: {
		if (data.status === HTTPStatusServerError) {
			toastStore.send({
				message: data.message as string,
				variant: 'error'
			});
		} else {
			userStore.set(data.user as User);
		}
	}
</script>

<Header />

<main class="mt-12 w-screen h-screen">
	<slot />
</main>

<footer></footer>

<Toast />
