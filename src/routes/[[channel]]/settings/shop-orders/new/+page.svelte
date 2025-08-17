<script lang="ts">
	import { tranFunc } from '$i18n';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus } from '$lib/components/icons';
	import GeneralSection from '$lib/components/pages/settings/orders/new/general-section.svelte';
	// import Sidebar from '$lib/components/pages/settings/orders/new/sidebar.svelte';
	import { Button } from '$lib/components/ui';
	import { Badge } from '$lib/components/ui/Badge';
	import { OrderStatus } from '$lib/gql/graphql';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { orderStatusBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';

	// const CHANNEL_REQUIRE_ERR = $tranFunc('helpText.fieldRequired');

	// let channelId = $state<string>();
	// let showChannelNotSet = $state(false);

	// const handleClickAddProduct = async () => {
	// 	if (!channelId) {
	// 		showChannelNotSet = true;
	// 		toast.warning('Please specify a channel first');
	// 	}
	// };

	let channelSlug = $state<string>('');
	let showChannelNotSetError = $state(false);
</script>

<div class="flex gap-2">
	<GeneralSection {channelSlug} bind:showChannelNotSetError />
	<!-- <Sidebar bind:channelSlug {showChannelNotSetError} /> -->
</div>
