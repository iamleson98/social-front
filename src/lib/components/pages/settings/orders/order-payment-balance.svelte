<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import type { Order } from '$lib/gql/graphql';
	import { paymentStatusBadgeClass } from '$lib/utils/utils';

	type Props = {
		order: Order;
	};

	let { order }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader>
		<div>
			Payment balance
			<Badge {...paymentStatusBadgeClass(order.paymentStatus)} rounded />
		</div>
		<Button size="xs" variant="light">refund</Button>
	</SectionHeader>

	<div class="mt-4 space-y-2 text-sm text-gray-600">
		<div class="flex justify-between">
			<span>Subtotal</span>
			<span>{order.subtotal.gross.amount} {order.subtotal.gross.currency}</span>
		</div>
		<div class="flex justify-between">
			<span>Shipping</span>
			<span>{order.shippingPrice.gross.amount} {order.shippingPrice.gross.currency}</span>
		</div>
		<div class="flex justify-between">
			<span>Taxes</span>
			<span
				>{order.total.gross.amount - order.subtotal.gross.amount - order.shippingPrice.gross.amount}
				{order.total.gross.currency}</span
			>
		</div>
		<div class="flex justify-between font-semibold">
			<span>Total</span>
			<span>{order.total.gross.amount} {order.total.gross.currency}</span>
		</div>
	</div>
</div>
