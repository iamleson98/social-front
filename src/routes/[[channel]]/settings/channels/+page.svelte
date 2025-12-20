<script lang="ts">
	import { T } from '$i18n';
	import { CHANNEL_DELETE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		Table,
		TableSkeleton,
		type SortState,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { Channel, Mutation, MutationChannelDeleteArgs, Query } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY,
	});

	const CHANNEL_COLUMNS: TableColumnProps<Channel, string>[] = $derived([
		{
			title: $T('common.name'),
			key: 'name',
			child: name,
		},
		{
			title: $T('common.currency'),
			child: currency,
		},
		{
			title: $T('staff.status'),
			child: status,
		},
		{
			title: $T('common.action'),
			child: action,
		},
	]);

	let channelToDeleteId = $state<string>();
	let channelToReplaceId = $state<string>();
	let loading = $state(false);
	let allChannels = $state<Channel[]>([]);

	onMount(() =>
		channelsQuery.subscribe((data) => {
			if (data?.data) {
				allChannels = data.data.channels || [];
			}
		}),
	);

	let channelsToReplaceOptions = $derived.by(() => {
		if (!channelToDeleteId) return [];
		if (!$channelsQuery.data?.channels?.length) return [];
		let channelToDel: Channel | undefined = undefined;

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
				label: channel.slug,
			});
		}

		if (channelToDel) return currencyMeetMap[channelToDel.currencyCode] || [];
		return [];
	});

	const handleDeleteChannel = async () => {
		if (!channelToDeleteId) return;

		const variable: MutationChannelDeleteArgs = {
			id: channelToDeleteId,
		};
		if (channelToReplaceId) {
			variable.input = {
				channelId: channelToReplaceId,
			};
		}

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelDelete'>,
			MutationChannelDeleteArgs
		>(CHANNEL_DELETE_MUTATION, variable);

		loading = false;

		if (checkIfGraphqlResultHasError(result, 'channelDelete', $CommonState.DeleteSuccess)) return;

		channelToDeleteId = '';
		channelToReplaceId = '';
		channelsQuery.reexecute({ variables: {} });
	};

	const handleSortChange = (state: SortState<any>) => {
		if (state['name'] === 'ASC') {
			allChannels.sort((f, s) => (f.name < s.name ? -1 : 1));
		} else if (state['name'] === 'DESC') {
			allChannels.sort((f, s) => (f.name > s.name ? -1 : 1));
		}
	};
</script>

{#snippet name({ item }: { item: Channel })}
	<a href={AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.slug)} class="link">{item.name}</a>
{/snippet}

{#snippet status({ item }: { item: Channel })}
	<Badge
		text={item.isActive ? $T('staff.active') : $T('staff.inactive')}
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

{#snippet currency({ item }: { item: Channel })}
	<span>{item.currencyCode}</span>
{/snippet}

{#snippet action({ item }: { item: Channel })}
	{@const MENU_OPTIONS: MenuItemProps[] = [
		{
			children: $T('channel.edit'),
			startIcon: Edit,
      href: AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(item.id)
		},
		{
			children: $T('channel.del'),
			startIcon: Trash,
			onclick: () => channelToDeleteId = item.id,
			class: 'text-red-600',
		}
	]}
	<DropDown options={MENU_OPTIONS}>
		{#snippet trigger(opts)}
			<IconButton icon={Dots} {...opts} size="xs" variant="light" color="gray" />
		{/snippet}
	</DropDown>
{/snippet}

{#if $channelsQuery.fetching}
	<TableSkeleton numColumns={4} />
{:else if $channelsQuery.error}
	<Alert variant="error" size="sm" bordered>
		{$channelsQuery.error.message}
	</Alert>
{:else if $channelsQuery.data}
	<Table columns={CHANNEL_COLUMNS} items={allChannels} onSortChange={handleSortChange} />
{/if}

<Modal
	open={!!channelToDeleteId}
	header={$T('channel.confirmDelChannel', { id: channelToDeleteId })}
	onOk={handleDeleteChannel}
	onCancel={() => (channelToDeleteId = '')}
	onClose={() => (channelToDeleteId = '')}
	closeOnOutsideClick
	size="sm"
	cancelText={$T('common.cancel')}
	okText={$T('btn.delete')}
	disableElements={loading}
>
	{#if channelsToReplaceOptions.length}
		<Select
			options={channelsToReplaceOptions}
			bind:value={channelToReplaceId}
			label={$T('channel.chanToReplace')}
			placeholder={$T('channel.chanToReplace')}
			disabled={loading}
		/>
		<Alert variant="info" size="sm" bordered class="mt-3">
			{$T('channel.replaceChanHelpTxt')}
		</Alert>
	{/if}
</Modal>
