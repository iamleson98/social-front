<script lang="ts">
	import { OrderStatus, type Order } from '$lib/gql/graphql';
	import OrderDraftDetails from './order-draft-details.svelte';

	type Props = {
		order: Order;
		loading?: boolean;
	};

	let { order, loading }: Props = $props();
</script>

{#if order.status === OrderStatus.Unconfirmed}
	<OrderDraftDetails {order} {loading} />
{/if}
