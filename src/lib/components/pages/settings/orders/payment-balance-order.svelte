<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Order } from '$lib/gql/graphql';

	type Props = {
		order: Order;
	};

  let { order }: Props = $props();
</script>

<div class="bg-white shadow rounded p-4">
  <div class="flex justify-between items-center">
    <h2 class="font-bold text-lg">Payment balance</h2>
    <Badge variant="light" color="green" text={order.chargeStatus} />
  </div>

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
      <span>{order.total.gross.amount - order.subtotal.gross.amount - order.shippingPrice.gross.amount} {order.total.gross.currency}</span>
    </div>
    <div class="flex justify-between font-semibold">
      <span>Total</span>
      <span>{order.total.gross.amount} {order.total.gross.currency}</span>
    </div>
  </div>
</div>