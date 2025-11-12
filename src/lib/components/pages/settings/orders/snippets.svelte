<script lang="ts" module>
	import { Button } from '$lib/components/ui';
	import { Popover } from '$lib/components/ui/Popover';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { type Order } from '$lib/gql/graphql';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { OrderUtilsInstance } from './utils.svelte';

	export const Components = {
		shippingMethodModal,
	};

	let loading = $state(false);
</script>

{#snippet shippingMethodModal(order: Order, onRefetchOrder?: () => void)}
	{@const ShippingMethodChoices = order.shippingMethods.map<SelectOption>((method) => ({
		label: `${method.name} : ${method.price.currency} ${method.price.amount}`,
		value: method.id,
		disabled: !method.active,
	}))}
	<Popover placement="bottom-start">
		{#snippet trigger({ onclick })}
			<Button size="xs" variant="light" color="blue" {onclick} disabled={loading}>
				{order.shippingMethodName || 'Shipping Method'}
			</Button>
		{/snippet}

		<div class="{SitenameCommonClassName} w-3xs shadow-md">
			<Select
				label="Please specify a shipping method"
				options={ShippingMethodChoices}
				disabled={OrderUtilsInstance.state.loading || loading}
				value={order.deliveryMethod?.id}
				size="sm"
				onchange={async (opt) => {
					if (opt) {
						const ok = await OrderUtilsInstance.updateShippingMethod(order.id, {
							shippingMethod: (opt as SelectOption).value as string,
						});
						if (ok) onRefetchOrder?.();
					}
				}}
			/>
		</div>
	</Popover>
{/snippet}
