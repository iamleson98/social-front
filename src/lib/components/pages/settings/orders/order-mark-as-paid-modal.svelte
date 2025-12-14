<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Order } from '$lib/gql/graphql';
	import { OrderUtilsInstance } from './utils.svelte';
	import toast from 'svelte-french-toast';

	type Props = {
		open: boolean;
		onRefetchOrder?: () => void;
		order: Order;
	};

	let { open = $bindable(), onRefetchOrder, order }: Props = $props();

	let transactionReference = $state('');
</script>

<Modal
	header="Mark order as paid"
	size="sm"
	bind:open
	okText={$tranFunc('common.ok')}
	cancelText={$tranFunc('common.cancel')}
	onOk={async () => {
		const ok = await OrderUtilsInstance.markAsPaid(order.id, transactionReference);
		if (ok) {
			toast.success('Order merked as paid successfully');
			open = false;
			onRefetchOrder?.();
		}
	}}
	disableElements={OrderUtilsInstance.state.loading}
>
	<Alert size="sm" class="mb-2">
		You're going to mark this order as paid. Please provide a transaction reference using the input
		below:
	</Alert>

	<Input
		placeholder="transaction reference"
		bind:value={transactionReference}
		label="Transaction reference"
		disabled={OrderUtilsInstance.state.loading}
	/>
</Modal>
