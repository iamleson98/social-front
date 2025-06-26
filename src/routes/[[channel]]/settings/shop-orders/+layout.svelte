<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import { CREATE_DRAFT_ORDER_MUTATION } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import HeadBar from '$lib/components/pages/settings/common/head-bar.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Mutation, MutationDraftOrderCreateArgs } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import type { Snippet } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { MouseEventHandler } from 'svelte/elements';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	let loading = $state(false);
	let openChannelModal = $state(false);
	let channelId = $state('');

	const handleClickCreateOrder: MouseEventHandler<HTMLButtonElement> = async (evt) => {
		evt.preventDefault(); // prevent browser from following the link
		openChannelModal = true;
	};

	const handleCreateOrder = async () => {
		if (!channelId) {
			toast.warning('Please specify a channel first');
			return;
		}
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'draftOrderCreate'>,
			MutationDraftOrderCreateArgs
		>(CREATE_DRAFT_ORDER_MUTATION, {
			input: {
				channelId,
			},
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				result,
				'draftOrderCreate',
				'Navigating you to order creation page...',
			)
		)
			return;

		await goto(
			`${AppRoute.SETTINGS_ORDERS_DETAILS(result.data?.draftOrderCreate?.order?.id!)}?new=${true}`,
		);
	};
</script>

<HeadBar
	listingPageHref={AppRoute.SETTINGS_ORDERS()}
	listingPageLabel={$tranFunc('settings.orders')}
	newPageHref={AppRoute.SETTINGS_ORDERS_NEW()}
	newPageLabel={$tranFunc('settings.newOrder')}
	detailRouteID="/[[channel]]/settings/shop-orders/[id]"
	detailPageLabelGetter={(page) => page.params.id}
	onNewPageBtnClick={handleClickCreateOrder}
	disabled={loading}
/>

<div>
	{@render children()}
</div>

<Modal
	open={openChannelModal}
	onClose={() => (openChannelModal = false)}
	closeOnEscape
	closeOnOutsideClick
	onCancel={() => (openChannelModal = false)}
	header="Channel for order"
	size="xs"
	onOk={handleCreateOrder}
	disableElements={loading}
>
	<Alert size="sm" bordered class="mb-1">Please specify a channel for this new order</Alert>
	<ChannelSelect
		label="Select channel"
		required
		placeholder="select channel"
		disabled={loading}
		bind:value={channelId}
		valueType="id"
	/>
</Modal>
