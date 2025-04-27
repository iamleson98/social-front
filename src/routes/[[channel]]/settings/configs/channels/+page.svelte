<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNEL_DELETE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import {
		DropDown,
		type DropdownTriggerInterface,
		type MenuItemProps
	} from '$lib/components/ui/Dropdown';
	import { Modal } from '$lib/components/ui/Modal';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Table, TableSkeleton, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Channel, Mutation, MutationChannelDeleteArgs, Query } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY
	});

	const CHANNEL_COLUMNS: TableColumnProps<Channel>[] = [
		{
			title: 'Name',
			key: 'name',
			child: name,
			sortable: true
		},
		{
			title: 'Currency',
			key: 'currency',
			child: currency
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Action',
			child: action
		}
	];

	let channelToDeleteId = $state<string>();
	let channelToReplaceId = $state<string>();
	let loading = $state(false);

	let channelsToReplaceOptions = $derived.by(() => {
		if (!channelToDeleteId) return [];
		if (!$channelsQuery.data?.channels?.length) return [];
		let channelToDel: Channel | undefined = undefined;

		// const result: SelectOption[] = [];
		const currencyMeetMap: Record<string, SelectOption[]> = {};

		for (const channel of $channelsQuery.data.channels) {
			if (channel.id === channelToDeleteId) {
				channelToDel = channel;
				continue;
			}
			if (currencyMeetMap[channel.currencyCode] === undefined) {
				currencyMeetMap[channel.currencyCode] = [];
			}

			currencyMeetMap[channel.currencyCode].push({
				value: channel.id,
				label: channel.slug
			});
		}

		if (channelToDel) return currencyMeetMap[channelToDel.currencyCode] || [];
		return [];
	});

	let delModalHeader = $derived($tranFunc('settings.confirmDelChannel', { id: channelToDeleteId }));

	const handleDeleteChannel = async () => {
		if (!channelToDeleteId) return;

		const variable: MutationChannelDeleteArgs = {
			id: channelToDeleteId
		};
		if (channelToReplaceId) {
			variable.input = {
				channelId: channelToReplaceId
			};
		}

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelDelete'>>(
			CHANNEL_DELETE_MUTATION,
			variable
		);

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelDelete')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel deleted successfully'
		});
	};
</script>

{#snippet name({ item }: { item: Channel })}
	<a href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.id)} class="link">{item.name}</a>
{/snippet}

{#snippet status({ item }: { item: Channel })}
	{#if item.isActive}
		<Badge text="Active" color="green" variant="light" />
	{:else}
		<Badge text="Inactive" color="red" variant="light" />
	{/if}
{/snippet}

{#snippet currency({ item }: { item: Channel })}
	<span>{item.currencyCode}</span>
{/snippet}

{#snippet action({ item }: { item: Channel })}
	{@const MENU_OPTIONS: MenuItemProps[] = [
		{
			children: 'Edit channel',
			startIcon: Edit,
      href: AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.id)
		},
		{
			children: 'Delete channel',
			startIcon: Trash,
			onclick: () => channelToDeleteId = item.id,
			class: 'text-red-600',
		}
	]}
	{#snippet trigger(opts: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...opts} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown {trigger} options={MENU_OPTIONS} />
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-4">
	{#if $channelsQuery.fetching}
		<TableSkeleton numColumns={3} />
	{:else if $channelsQuery.error}
		<Alert variant="error" size="sm" bordered>
			{$channelsQuery.error.message}
		</Alert>
	{:else if $channelsQuery.data}
		<Table columns={CHANNEL_COLUMNS} items={$channelsQuery.data?.channels || []} />
	{/if}
</div>

<Modal
	open={!!channelToDeleteId}
	header={delModalHeader}
	onOk={handleDeleteChannel}
	onCancel={() => (channelToDeleteId = '')}
	onClose={() => (channelToDeleteId = '')}
	closeOnOutsideClick
	size="sm"
	cancelText={$tranFunc('common.cancel')}
	okText={$tranFunc('btn.delete')}
	disableElements={loading}
>
	{#if channelsToReplaceOptions.length}
		<Select
			options={channelsToReplaceOptions}
			bind:value={channelToReplaceId}
			label="Please specify channel to replace"
			placeholder="Channel to replace"
			disabled={loading}
		/>
		<Alert variant="info" size="sm" bordered class="mt-3">
			Specify a new channel to assign products to. The replace channel must have the same currency
			as deleting channel
		</Alert>
	{/if}
</Modal>
