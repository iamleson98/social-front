<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { type Order } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import OrderFulfillModal from './order-fulfill-modal.svelte';
	import OrderLines from './order-lines.svelte';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();

	let openFulfillModal = $state(false);
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<Badge text="Unfulfilled" color="violet" size="sm" rounded />
	</SectionHeader>

	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning">
			This order has no product yet. Please add more.
		</Alert>
	{:else}
		<OrderLines orderLines={order.lines} {order} />
		<div class="text-right">
			<Button size="xs" color="gray" onclick={() => (openFulfillModal = true)}>
				Fulfill lines
			</Button>
		</div>

		<OrderFulfillModal bind:open={openFulfillModal} {order} onFulfillSuccess={() => {}} />
	{/if}
</div>
