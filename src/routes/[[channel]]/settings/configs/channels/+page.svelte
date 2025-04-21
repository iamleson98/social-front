<script lang="ts">
	import { tranFunc } from '$i18n';
	import { CHANNELS_QUERY } from '$lib/api/channels';
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
	import type { Channel, Query } from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';

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

	let delModalHeader = $derived($tranFunc('settings.confirmDelChannel', { id: channelToDeleteId }));

	const handleConfirmDeleteChannel = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('settings.confirmDelChannel', { id }),
			onOk: () => {}
		});
	};
</script>

{#snippet name({ item }: { item: Channel })}
	<a href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.slug)} class="link">{item.name}</a>
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
      href: AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.slug)
		},
		{
			children: 'Delete channel',
			startIcon: Trash,
			onclick: () => channelToDeleteId = item.id,
			class: 'text-red-500',

		}
	]}
	{#snippet trigger(opts: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...opts} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown {trigger} options={MENU_OPTIONS} />
{/snippet}

<div class="bg-white rounded-lg border border-gray-200 p-3">
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
	onClose={() => (channelToDeleteId = '')}
	onCancel={() => (channelToDeleteId = '')}
	closeOnOutsideClick
	size="sm"
	cancelText={$tranFunc('common.cancel')}
	okText={$tranFunc('product.detail')}
>
	<Select
		options={$channelsQuery.data?.channels?.map<SelectOption>((chan) => ({
			value: chan.id,
			label: chan.name,
			disabled: channelToDeleteId === chan.id
		})) ?? []}
		bind:value={channelToReplaceId}
		label="Please specify channel to replace"
		required
		placeholder="Channel to replace"
	/>
</Modal>
