<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { SHOP_QUERY } from '$lib/api/shop';
	import type { Query } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { setShopStoreValue } from '$lib/stores/shop';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	onMount(async () => {
		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'shop'>>(
			SHOP_QUERY,
			{
				isStaffUser: $READ_ONLY_USER_STORE?.isStaff,
			},
			{ requestPolicy: 'cache-and-network' },
		);

		if (result.error) {
			toast.error(result.error.message);
			return;
		}

		setShopStoreValue(result.data?.shop);
	});
</script>
