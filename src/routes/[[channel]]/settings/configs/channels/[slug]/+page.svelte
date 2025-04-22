<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DETAILS_QUERY, CHANNEL_DELETE_MUTATION } from '$lib/api/admin/channels';
	import type { Mutation, MutationChannelDeleteArgs, Query } from '$lib/gql/graphql';
	import Input from '$lib/components/ui/Input/input.svelte';
	import {
		DropDown,
		type DropdownTriggerInterface,
		type MenuItemProps
	} from '$lib/components/ui/Dropdown';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { Modal } from '$lib/components/ui/Modal';
	import { tranFunc } from '$i18n';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import { Alert } from '$lib/components/ui/Alert';
	import { CHANNELS_QUERY } from '$lib/api/channels';

	let channelToDeleteId = $state<string>();
	let channelToReplaceId = $state<string>();
	let delModalHeader = $derived($tranFunc('settings.confirmDelChannel', { id: channelToDeleteId }));

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY,
		variables: {
			slug: page.params.slug
		}
	});

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

		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelDelete'>>(
			CHANNEL_DELETE_MUTATION,
			variable
		);

		if (preHandleErrorOnGraphqlResult(result, 'channelDelete')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel deleted successfully'
		});
	};

	const channel = $derived($channelDetailQuery.data?.channel);
	const channelName = $derived(channel?.name);
	const channelCurrency = $derived(channel?.currencyCode);
	const channelSlug = $derived(channel?.slug);
	const isChannelActive = $derived(channel?.isActive);

	const MENU_OPTIONS: MenuItemProps[] = [
		{
			children: 'Active',
			onclick: () => {},
			class: 'text-green-600'
		},
		{
			children: 'Inactive',
			onclick: () => {},
			class: 'text-red-600'
		}
	];

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY
	});
</script>

{#if $channelDetailQuery.fetching}
	<TableSkeleton numColumns={1} />
{:else if $channelDetailQuery.error}
	<p class="text-red-500">{$channelDetailQuery.error.message}</p>
{:else if $channelDetailQuery.data?.channel}
	<h1 class="text-lg font-bold">General Information</h1>
	<Input label="Name" value={channelName} class="mt-3" />
	<Input label="Slug" value={channelSlug} class="mt-3" />

	<h1 class="text-lg font-bold mt-5">Channel Setting</h1>
	<Input label="Currency" value={channelCurrency} disabled class="mt-3" />

	{#snippet trigger(opts: DropdownTriggerInterface)}
		{#if isChannelActive}
			<span {...opts}>
				<Badge text="Active" color="green" variant="light" class="mt-3" />
			</span>
		{:else}
			<span {...opts}>
				<Badge text="Inactive" color="red" variant="light" class="mt-3" />
			</span>
		{/if}
	{/snippet}
	<DropDown {trigger} options={MENU_OPTIONS} />

	<div class="mt-5 flex justify-between items-center">
		<div>
			<Button
				variant="light"
				color="red"
				onclick={() => {
					if (channel?.id) {
						channelToDeleteId = channel.id; // chỉ mở modal
					}
				}}
			>
				Delete
			</Button>
		</div>
		<div class="space-x-2">
			<Button variant="light" color="gray">Cancel</Button>
			<Button>Update</Button>
		</div>
	</div>
{/if}

<Modal
	open={!!channelToDeleteId}
	header={delModalHeader}
	onOk={async () => {
		await handleDeleteChannel();
		goto(AppRoute.SETTINGS_CONFIGS_CHANNELS(channelSlug ?? ''));
	}}
	onCancel={() => (channelToDeleteId = '')}
	onClose={() => (channelToDeleteId = '')}
	closeOnOutsideClick
	size="sm"
	cancelText={$tranFunc('common.cancel')}
	okText={$tranFunc('btn.delete')}
>
	<Select
		options={$channelsQuery.data?.channels?.map<SelectOption>((chan) => ({
			value: chan.id,
			label: chan.name,
			disabled: channelToDeleteId === chan.id
		})) ?? []}
		bind:value={channelToReplaceId}
		label="Please specify channel to replace"
		placeholder="Channel to replace"
	/>
	<Alert variant="info" size="sm" bordered class="mt-3">
		Specify a new channel to assign products to. The replace channel must have the same currency as
		deleting channel
	</Alert>
</Modal>
