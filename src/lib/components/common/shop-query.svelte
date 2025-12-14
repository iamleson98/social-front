<script lang="ts">
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { SHOP_QUERY } from '$lib/api/shop';
	import type { Query } from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth';
	import { ShopStoreManager } from '$lib/stores/shop';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';

	onMount(async () => {
		const result = await GRAPHQL_CLIENT.query<Pick<Query, 'shop'>>(
			SHOP_QUERY,
			{
				isStaffUser: $UserStoreManager?.isStaff,
			},
			{ requestPolicy: 'cache-and-network' },
		);

		if (result.error) {
			toast.error(result.error.message);
			return;
		}

		ShopStoreManager.setValue(result.data?.shop);
	});
</script>
