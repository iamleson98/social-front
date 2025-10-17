<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { type Order } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import OrderFulfillModal from './order-fulfill-modal.svelte';
	import OrderLineAssignModal from './order-line-assign-modal.svelte';
	import OrderLines from './order-lines.svelte';

	type Props = {
		order: Order;
		onAddedOrderLines?: () => void;
		/** only in draft order this prop should be true */
		allowAddOrderLines?: boolean;
	};

	let { order, onAddedOrderLines, allowAddOrderLines }: Props = $props();

	let openFulfillModal = $state(false);
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<Badge text="Unfulfilled" color="violet" size="sm" rounded />
		<!-- {#if allowAddOrderLines}
			<OrderLineAssignModal
				{onAddedOrderLines}
				orderId={order.id}
				orderChannelSlug={order.channel.slug}
			/>
		{/if} -->
	</SectionHeader>

	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning">
			This order has no product yet. Please add more.
		</Alert>
	{:else}
		<OrderLines orderLines={order.lines} {order} />
	{/if}

	<div class="text-right">
		<Button size="xs" color="gray" onclick={() => (openFulfillModal = true)}>Fulfill lines</Button>
	</div>
</div>

<OrderFulfillModal bind:open={openFulfillModal} {order} onFulfillSuccess={() => {}} />
