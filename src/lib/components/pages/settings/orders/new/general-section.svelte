<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { OrderStatus } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import VariantsModal from './variants-modal.svelte';

	type Props = {
		channelSlug: string;
		showChannelNotSetError: boolean;
	};

	let { channelSlug, showChannelNotSetError = $bindable() }: Props = $props();

	let openVariantsModal = $state(false);
	// let selectedChannelSlug = $state('');

	const handleClickAddProduct = async () => {
		if (!channelSlug) {
			showChannelNotSetError = true;
			return;
		}

		openVariantsModal = true;
	};
</script>

<div class="w-7/10 space-y-2">
	<SectionHeader>
		<div class="flex items-center gap-2">
			<Badge {...orderStatusBadgeClass(OrderStatus.Draft)} rounded />
			<div class="text-xs font-semibold text-gray-500">
				{dayjs().format(SitenameTimeFormat)}
			</div>
		</div>
	</SectionHeader>

	<div class="rounded-lg border border-gray-200 p-3 bg-white">
		<SectionHeader>
			<div>Order Details</div>
			<Button
				endIcon={Plus}
				size="xs"
				variant="outline"
				color="gray"
				onclick={handleClickAddProduct}
			>
				Add Products
			</Button>
		</SectionHeader>
	</div>
</div>

<VariantsModal {channelSlug} bind:open={openVariantsModal} />
