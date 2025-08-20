<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ChevronRight, Icon } from '$lib/components/icons';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import { type TabItem } from '$lib/components/ui/Tab';
	import { TableSkeleton } from '$lib/components/ui/Table';
	import type {
		Mutation,
		MutationChannelUpdateArgs,
		OrderSettingsInput,
		Query,
	} from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { AppRoute } from '$lib/utils/routes';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	const ChannelsQuery = operationStore<Pick<Query, 'channels'>>({
		query: CHANNELS_QUERY,
		requestPolicy: 'cache-and-network',
	});

	const ChannelTab = $derived(page.url.searchParams.get('chan'));
	let loading = $state(false);
	let activeChannelId = $state<string>();

	let activeChannelOrderConfig = $state<OrderSettingsInput>({
		automaticallyConfirmAllNewOrders: true,
		automaticallyFulfillNonShippableGiftCard: true,
	});

	onMount(() =>
		ChannelsQuery.subscribe((result) => {
			if (result.data?.channels && !ChannelTab) {
				goto(AppRoute.SETTINGS_SHOP_ORDER_SETTINGS(result.data.channels[0].slug));
			}
		}),
	);

	afterNavigate(() => {
		if (ChannelTab && $ChannelsQuery.data?.channels) {
			const selectedChan = $ChannelsQuery.data.channels.find((chan) => chan.slug === ChannelTab);
			if (selectedChan) {
				activeChannelId = selectedChan.id;

				activeChannelOrderConfig = {
					automaticallyConfirmAllNewOrders:
						selectedChan.orderSettings.automaticallyConfirmAllNewOrders,
					automaticallyFulfillNonShippableGiftCard:
						selectedChan.orderSettings.automaticallyFulfillNonShippableGiftCard,
				};
			}
		}
	});

	const handleUpdateChannelOrderSettings = async () => {
		if (!activeChannelId) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelUpdate'>,
			MutationChannelUpdateArgs
		>(CHANNEL_UPDATE_MUTATION, {
			input: { orderSettings: activeChannelOrderConfig },
			id: activeChannelId,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'channelUpdate', CommonState.EditSuccess)) return;

		ChannelsQuery.reexecute({ variables: {} });
	};
</script>

{#if $ChannelsQuery.fetching}
	<div class="flex gap-2">
		<div class="w-1/4">
			<TableSkeleton numColumns={1} numOfRows={4} />
		</div>
		<div class="w-3/4">
			<TableSkeleton numOfRows={3} numColumns={2} />
		</div>
	</div>
{:else if $ChannelsQuery.error}
	<Alert size="sm" variant="error">{$ChannelsQuery.error.message}</Alert>
{:else if $ChannelsQuery.data?.channels}
	{@const items: TabItem[] = $ChannelsQuery.data.channels.map<TabItem>((chan) => ({
		title: chan.name,
		active: (ChannelTab === chan.slug),
		href: AppRoute.SETTINGS_SHOP_ORDER_SETTINGS(chan.slug),
	}))}
	<div class="flex gap-2">
		<div class="w-1/4">
			<AccordionList header="Channels" {items} class={SitenameCommonClassName}>
				{#snippet child(item)}
					<a href={item.href}>
						<div
							class={[
								'flex items-center justify-between gap-2 rounded-lg hover:bg-blue-100 transition-all hover:text-blue-600 px-2 py-2',
								item.active && 'bg-blue-100 font-medium text-blue-600',
							]}
						>
							<span>{item.title}</span>
							{#if item.active}
								<span transition:fly={{ x: -10 }}>
									<Icon icon={ChevronRight} size="sm" />
								</span>
							{/if}
						</div>
					</a>
				{/snippet}
			</AccordionList>
		</div>
		<div class="w-3/4">
			{#if ChannelTab}
				<div class={SitenameCommonClassName}>
					<SectionHeader>General settings</SectionHeader>
					<Checkbox
						disabled={loading}
						label="Automatically confirm all orders"
						subText="All orders will be automatically confirmed and all payments will be captured."
						bind:checked={activeChannelOrderConfig.automaticallyConfirmAllNewOrders}
						size="sm"
					/>
					<Checkbox
						disabled={loading}
						label="Automatically confirm all orders"
						subText="All orders will be automatically confirmed and all payments will be captured."
						bind:checked={activeChannelOrderConfig.automaticallyFulfillNonShippableGiftCard}
						size="sm"
					/>
				</div>

				<ActionBar
					onUpdateClick={handleUpdateChannelOrderSettings}
					backButtonUrl={AppRoute.SETTINGS_ORDERS()}
					disabled={loading}
				/>
			{:else}
				<TableSkeleton numColumns={1} numOfRows={4} />
			{/if}
		</div>
	</div>
{/if}
