<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { type Order } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import OrderLineAssignModal from './order-line-assign-modal.svelte';
	import OrderLines from './order-lines.svelte';

	type Props = {
		order: Order;
		onAddedOrderLines?: () => void;
		/** only in draft order this prop should be true */
		allowAddOrderLines?: boolean;
	};

	let { order, onAddedOrderLines, allowAddOrderLines }: Props = $props();
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Order Details</div>
		{#if allowAddOrderLines}
			<OrderLineAssignModal
				{onAddedOrderLines}
				orderId={order.id}
				orderChannelSlug={order.channel.slug}
			/>
		{/if}
	</SectionHeader>

	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning">
			This order has no product yet. Please add more.
		</Alert>
	{:else}
		<OrderLines orderLines={order.lines} {order} />
	{/if}
</div>
