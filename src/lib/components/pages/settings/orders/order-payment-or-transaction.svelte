<script lang="ts">
	import { Alert } from '$lib/components/ui/Alert';
	import type { Order } from '$lib/gql/graphql';
	import { orderShouldUseTransactions } from './utils';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();
</script>

{#if orderShouldUseTransactions(order)}
	{@const filteredPayments =
		order.payments?.filter((pm) => pm.isActive || !!pm.transactions?.length) || []}
	{@const hasAnyTransactions =
		order.transactions.length || filteredPayments.length || order.giftCards.length}

	{#if !hasAnyTransactions}
		<Alert size="sm" variant="warning">No transactions made for this order.</Alert>
	{/if}
{/if}
