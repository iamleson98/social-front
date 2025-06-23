<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/badge';
	import { OrderStatus } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';

	const CHANNEL_REQUIRE_ERR = $tranFunc('helpText.fieldRequired');

	let channelId = $state<string>();
	let showChannelNotSet = $state(false);

	const handleClickAddProduct = async () => {
		if (!channelId) {
			showChannelNotSet = true;
			toast.warning('Please specify a channel first');
		}
	};
</script>

<div class="flex gap-2">
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
					onclick={handleClickAddProduct}>Add Products</Button
				>
			</SectionHeader>
		</div>
	</div>

	<div class="w-3/10 space-y-2">
		<div class="rounded-lg border border-gray-200 bg-white p-3">
			<SectionHeader>Channel</SectionHeader>

			<ChannelSelect
				required
				placeholder="Select channel"
				size="sm"
				label="Specify channel of order"
				valueType="slug"
				variant={!channelId && showChannelNotSet ? 'error' : 'info'}
				subText={!channelId && showChannelNotSet ? CHANNEL_REQUIRE_ERR : undefined}
			/>
		</div>
	</div>
</div>
