<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Ban, SettingCog } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { OrderStatus, type Order } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		order: Order;
		onCancelOrder?: () => void;
	};

	let { order, onCancelOrder }: Props = $props();
</script>

<SectionHeader>
	<div class="flex items-center gap-2">
		<div>Order #{order.number}</div>
		<Badge size="sm" rounded {...orderStatusBadgeClass(order.status)} />
		<div class="text-xs text-gray-500 font-medium">
			{dayjs(order.created).format(SitenameTimeFormat)}
		</div>
	</div>

	<DropDown placement="bottom-end">
		{#snippet trigger({ onclick })}
			<IconButton icon={SettingCog} size="xs" color="gray" {onclick} />
		{/snippet}

		{#if order.status !== OrderStatus.Canceled}
			<MenuItem class="text-red-500" startIcon={Ban} onclick={onCancelOrder}>
				Cancel order
			</MenuItem>
		{/if}
	</DropDown>
</SectionHeader>
