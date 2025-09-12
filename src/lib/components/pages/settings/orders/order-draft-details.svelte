<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Order } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { noop } from 'es-toolkit';
	import OrderLines from './order-lines.svelte';

	type Props = {
		loading?: boolean;
		order: Order;
	};

	let { loading, order }: Props = $props();

	const handleClickAddProductVariants = () => {};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>Order Details</div>
		<Button
			endIcon={Plus}
			size="xs"
			variant="outline"
			color="gray"
			onclick={handleClickAddProductVariants}
		>
			Add Products
		</Button>
	</SectionHeader>
</div>

<div class={SitenameCommonClassName}>
	{#if !order.lines.length}
		<Alert size="sm" bordered variant="warning">
			This order has no product yet. Please add more.
		</Alert>
	{/if}
</div>

<OrderLines orderLines={order.lines} {order} onFulfillSuccess={noop} />
