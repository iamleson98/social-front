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
	import {
		Icon,
		AdjustmentHorizontal,
		UserCog,
		type IconContent,
		Trash
	} from '$lib/components/icons';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Checkbox } from '$lib/components/ui/Input';

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

	const delModalHeader = $derived(
		$tranFunc('settings.confirmDelChannel', { id: channelToDeleteId })
	);
	const countriesOptions = $derived(
		$channelDetailQuery.data?.channel?.countries?.map((c) => ({
			value: c.country,
			label: c.country
		})) ?? []
	);

	const setActive = (active: boolean) => (updatedIsActive = active);

	$effect(() => {
		const channel = $channelDetailQuery.data?.channel;
		if (channel) {
			updatedName = channel.name;
			updatedSlug = channel.slug;
			updatedIsActive = channel.isActive;
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
		if (!$channelDetailQuery.data?.channel?.id) return;

		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelUpdate'>>(
			CHANNEL_UPDATE_MUTATION,
			{
				id: $channelDetailQuery.data?.channel?.id,
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

	const validate = () => {
		if (!updatedName || !updatedSlug || !updatedCountry) {
			toastStore.send({
				variant: 'error',
				message: 'Please fill in all fields'
			});
			return false;
		}
		return true;
	}

	type TabItem = {
		name: string;
		href?: string;
		icon: IconContent;
	};

	const WAREHOUSE_TAB_ITEMS = $derived(
		$channelDetailQuery.data?.channel?.warehouses?.map((w) => ({
			name: w.name,
			href: undefined,
			icon: Trash
		})) ?? []
	);
</script>

<div class="flex gap-2">
	<div class="flex-1 rounded-lg bg-white border border-gray-200 mt-3 p-3">
		{#if $channelDetailQuery.fetching}
			<TableSkeleton numColumns={1} />
		{:else if $channelDetailQuery.error}
			<Alert variant="error" title="Error">{$channelDetailQuery.error.message}</Alert>
		{:else if $channelDetailQuery.data?.channel}
			<Input label="Name" bind:value={updatedName} class="mt-3" />
			<div class="mt-3 flex gap-3">
				<Input label="Slug" bind:value={updatedSlug} class="flex-1" />
				<div class="flex flex-1 gap-2 py-2">
					<Checkbox label="Active" checked={updatedIsActive}/>
					<Checkbox label="Inactive" checked={!updatedIsActive}/>
				</div>
			</div>

			<div class="mt-3 flex gap-3">
				<Input
					label="Currency"
					value={$channelDetailQuery.data?.channel?.currencyCode}
					disabled
					class="flex-1"
				/>
				<Select
					label="Country"
					options={countriesOptions}
					bind:value={updatedCountry}
					placeholder="Select a country"
					class="flex-1"
				/>
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
				Specify a new channel to assign products to. The replace channel must have the same currency
				as deleting channel
			</Alert>
		</Modal>
	</div>

	<div class="w-90 rounded-lg bg-white border border-gray-200 mt-3 p-2">
		{#snippet sidebarItem(item: TabItem)}
			{@const attrs = item.href ? { href: item.href } : {}}
			{@const active = item.href && item.href === page.url.pathname}
			<svelte:element
				this={item.href ? 'a' : 'div'}
				{...attrs}
				class="flex items-center justify-between gap-1 rounded-md py-1 {active
					? 'bg-blue-100 text-blue-700 font-semibold before:content-[" "] before:h-full before:w-2 before:rounded-sm before:bg-blue-500 before:absolute before:right-[calc(100%+4px)]'
					: ''} hover:bg-blue-100 hover:text-blue-700 cursor-pointer relative"
			>
				<span class="truncate">{item.name}</span>
				<Icon icon={item.icon} />
			</svelte:element>
		{/snippet}

		<AccordionList
			header="2 Warehouses"
			child={sidebarItem}
			items={WAREHOUSE_TAB_ITEMS}
			class="w-full"
			open={false}
		/>
	</div>
</div>

<div class="mt-5 flex justify-between items-center">
	<div>
		<Button
			variant="light"
			color="red"
			onclick={() => {
				if ($channelDetailQuery.data?.channel?.id) {
					channelToDeleteId = $channelDetailQuery.data?.channel?.id;
				}
			}}
		>
			Delete
		</Button>
	</div>
	<div class="space-x-2">
		<Button variant="light" color="gray" onclick={() => goto(AppRoute.SETTINGS_CONFIGS_CHANNELS())}
			>Back</Button
		>
		<Button onclick={handleUpdateChannel}>Update</Button>
	</div>
</div>
