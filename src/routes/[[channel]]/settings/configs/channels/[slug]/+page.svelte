<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
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
	import { CHANNEL_DETAILS_QUERY_STORE, CHANNELS_QUERY } from '$lib/api/channels';

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: { slug: page.params.slug }
	});
	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: CHANNELS_QUERY
	});

	let channelToDeleteId = $state<string>();
	let channelToReplaceId = $state<string>();
	let updatedName = $state('');
	let updatedSlug = $state('');
	let updatedIsActive = $state(true);
	let updatedCountry = $state<string>();

	const delModalHeader = $derived($tranFunc('settings.confirmDelChannel', { id: channelToDeleteId }));
	const channel = $derived($channelDetailQuery.data?.channel);
	const channelCurrency = $derived(channel?.currencyCode);
	const countriesOptions = $derived(
		channel?.countries?.map((c) => ({
			value: c.country,
			label: c.country
		})) ?? []
	);

	const setActive = (active: boolean) => (updatedIsActive = active);
	const MENU_OPTIONS: MenuItemProps[] = [
		{ children: 'Active', onclick: () => setActive(true), class: 'text-green-600' },
		{ children: 'Inactive', onclick: () => setActive(false), class: 'text-red-600' }
	];

	$effect(() => {
		if (channel) {
			updatedName = channel.name ?? '';
			updatedSlug = channel.slug ?? '';
			updatedIsActive = channel.isActive ?? true;
			updatedCountry = channel.countries?.[0]?.country ?? '';
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

	const handleUpdateChannel = async () => {
		if (!channel?.id) return;

		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelUpdate'>>(
			CHANNEL_UPDATE_MUTATION,
			{
				id: channel.id,
				input: {
					name: updatedName,
					slug: updatedSlug,
					isActive: updatedIsActive
				}
			}
		);

		if (preHandleErrorOnGraphqlResult(result, 'channelUpdate')) return;

		toastStore.send({
			variant: 'success',
			message: 'Channel updated successfully'
		});
	};
</script>

{#if $channelDetailQuery.fetching}
	<TableSkeleton numColumns={1} />
{:else if $channelDetailQuery.error}
	<p class="text-red-500">{$channelDetailQuery.error.message}</p>
{:else if $channelDetailQuery.data?.channel}
	<h1 class="text-lg font-bold">General Information</h1>
	<Input label="Name" bind:value={updatedName} class="mt-3" />
	<Input label="Slug" bind:value={updatedSlug} class="mt-3" />

	<h1 class="text-lg font-bold mt-5">Channel Setting</h1>
	<Input label="Currency" value={channelCurrency} disabled class="mt-3" />

	{#snippet trigger(opts: DropdownTriggerInterface)}
		{#if updatedIsActive}
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

	<Select
		label="Country"
		options={countriesOptions}
		bind:value={updatedCountry}
		placeholder="Select a country"
		class="mt-3"
	/>

	<div class="mt-5 flex justify-between items-center">
		<div>
			<Button
				variant="light"
				color="red"
				onclick={() => {
					if (channel?.id) {
						channelToDeleteId = channel.id;
					}
				}}
			>
				Delete
			</Button>
		</div>
		<div class="space-x-2">
			<Button variant="light" color="gray" onclick={() => goto(AppRoute.SETTINGS_CONFIGS_CHANNELS())}>Back</Button>
			<Button onclick={handleUpdateChannel}>Update</Button>
		</div>
	</div>
{/if}

<Modal
	open={!!channelToDeleteId}
	header={delModalHeader}
	onOk={async () => {
		await handleDeleteChannel();
		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
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
