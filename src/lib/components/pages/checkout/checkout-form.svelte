<script lang="ts">
	import { page } from '$app/stores';
	import { Email } from '$lib/components/icons';
	import { Input } from '$lib/components/ui/Input';
	import type { Checkout } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';

	type Props = {
		checkout: Checkout;
	};

	let { checkout }: Props = $props();
</script>

<div class="w-1/2 tablet:w-full p-2">
	<div class="text-sm">Account</div>

	{#if $userStore}
		<div>{$userStore.email}</div>
	{:else}
		<div>
			<div>
				<Input placeholder="Enter your email" size="md" startIcon={Email} />
			</div>

			<div class="text-right text-sm">
				Already have account ?
				<a
					class="inline underline text-blue-700"
					href={`${AppRoute.AUTH_SIGNIN}?next=${encodeURIComponent($page.url.href)}`}
				>
					Signin
				</a>
			</div>
		</div>
	{/if}

	<!-- shipping / billing -->
	 {#if checkout.isShippingRequired}
	 <!-- shipping -->
		{#if $userStore}
		
		{/if}
	 {/if}
</div>
