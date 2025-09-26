<script lang="ts">
	import { tranFunc } from '$i18n';
	import { GIFT_CARD_ADD_NOTE_MUTATION, GIFT_CARD_EVENTS_QUERY } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { CalendarClock, Send } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		GiftCardEventsEnum,
		type Mutation,
		type MutationGiftCardAddNoteArgs,
		type Query,
		type QueryGiftCardArgs,
	} from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
		timelineReloadTrigger: boolean;
	};

	let { id, timelineReloadTrigger = $bindable() }: Props = $props();

	let newNote = $state<string>();
	let loading = $state(false);
	let filterType = $state<GiftCardEventsEnum>();
	const filterTypeOptions = Object.values(GiftCardEventsEnum).map<SelectOption>((key) => ({
		value: key,
		label: key.toLowerCase().replace(/_/g, ' '),
	}));

	const eventsQuery = operationStore<Pick<Query, 'giftCard'>, QueryGiftCardArgs>({
		query: GIFT_CARD_EVENTS_QUERY,
		requestPolicy: 'network-only',
		variables: {
			id,
		},
	});

	$effect(() => {
		if (timelineReloadTrigger) {
			eventsQuery.reexecute({ variables: { id } });
			timelineReloadTrigger = false;
		}
	});

	const handleAddNote = async () => {
		if (!newNote) return;

		loading = true; //
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardAddNote'>,
			MutationGiftCardAddNoteArgs
		>(GIFT_CARD_ADD_NOTE_MUTATION, {
			id,
			input: {
				message: newNote,
			},
		});

		loading = false; //

		if (
			checkIfGraphqlResultHasError(
				result,
				'giftCardAddNote',
				$tranFunc('giftcard.events.noteAdded'),
			)
		)
			return;

		newNote = ''; // reset note
		eventsQuery.reexecute({ variables: { id } });
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$tranFunc('giftcard.timeline')}</SectionHeader>

	{#if $eventsQuery.fetching}
		<SelectSkeleton size="sm" label />
	{:else if $eventsQuery.error}
		<Alert size="sm" variant="error" bordered>{$eventsQuery.error.message}</Alert>
	{:else if $eventsQuery.data}
		{@const events =
			$eventsQuery.data.giftCard?.events
				.filter((event) => (filterType ? event.type === filterType : true))
				.sort(
					(a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(), // latest first
				) || []}
		<!-- MARK: note form -->
		<div class="flex gap-2 items-center">
			<div class="flex-3/4 flex items-center gap-2">
				<div class="avatar">
					<div class="w-9 rounded-lg">
						<img
							src={$UserStoreManager?.avatar?.url}
							alt={$UserStoreManager?.avatar?.alt}
						/>
					</div>
				</div>
				<Input
					size="sm"
					placeholder={$tranFunc('giftcard.addNote')}
					class="w-full"
					bind:value={newNote}
					disabled={loading}
				/>
			</div>
			<div class="flex-1/4">
				<Button
					size="sm"
					endIcon={Send}
					fullWidth
					variant="light"
					disabled={!newNote?.trim() || loading}
					onclick={handleAddNote}>{$tranFunc('giftcard.filter.submit')}</Button
				>
			</div>
		</div>

		<!-- MARK: event history -->
		<div class="relative w-full mx-auto px-4 bg-white dark:bg-gray-900">
			<!-- MARK: filter -->
			<div class="flex justify-end">
				<Select
					size="xs"
					bind:value={filterType}
					placeholder={$tranFunc('giftcard.filter.filterByType')}
					label={$tranFunc('giftcard.filter.filterByType')}
					options={filterTypeOptions}
					class="w-1/3"
				/>
			</div>
			<ol class="relative border-s border-gray-200 dark:border-gray-700 mt-2">
				{#each events as event, idx (idx)}
					{@const byName =
						event.user?.firstName || event.user?.lastName
							? `${event.user.firstName || ''} ${event.user.lastName || ''}`
							: event.user?.email}
					<li class="mb-4 ms-6">
						<IconButton
							icon={CalendarClock}
							size="xs"
							variant="light"
							color="orange"
							class="absolute! -start-3.5 ring-4 ring-white"
							rounded
						/>
						<div class="mb-1 font-medium text-sm dark:text-white text-gray-700">
							{event.type ? $tranFunc('giftcard.types.' + event.type) : ''}
						</div>
						<div class="text-xs font-normal leading-none text-gray-400 dark:text-gray-500 mb-1">
							{dayjs(event.date).fromNow()}
						</div>
						{#if event.type === GiftCardEventsEnum.NoteAdded}
							<div class="border-l-4 border-gray-200 p-2 bg-gray-50 text-gray-600 text-sm mb-1">
								<span>{event.message}</span>
							</div>
						{/if}
						<div class="text-xs text-gray-600">
							{$tranFunc('giftcard.by')}
							<a
								class="text-blue-600 text-sm font-semibold"
								href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(event.user?.id!)}
							>
								{byName}
							</a>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	{/if}
</div>
