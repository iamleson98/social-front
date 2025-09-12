<script lang="ts">
	import type { Order } from '$lib/gql/graphql';
	import OrderDetailsPage from './order-details-page.svelte';

	type Props = {
		order: Order;
		loading?: boolean;
	};

	let { order, loading }: Props = $props();
</script>

<OrderDetailsPage {order} {loading} />
