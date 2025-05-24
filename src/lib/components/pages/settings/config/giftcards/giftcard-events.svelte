<script lang="ts">
	import { GIFT_CARD_ADD_NOTE_MUTATION, GIFT_CARD_EVENTS_QUERY } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { CalendarClock, Send } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		type GiftCardEventFilterInput,
		GiftCardEventsEnum,
		type Mutation,
		type MutationGiftCardAddNoteArgs,
		type Query,
		type QueryGiftCardArgs,
	} from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	type Props = {
		id: string;
	};

	let { id }: Props = $props();

	let newNote = $state<string>();
	let loading = $state(false);

	const eventsQuery = operationStore<
		Pick<Query, 'giftCard'>,
		QueryGiftCardArgs & { filter: GiftCardEventFilterInput }
	>({
		kind: 'query',
		query: GIFT_CARD_EVENTS_QUERY,
		variables: {
			id,
		},
	});

	const giftcardTypeToHumanize = (type?: GiftCardEventsEnum | null) => {
		switch (type) {
			case GiftCardEventsEnum.Activated:
				return 'Gift card was activated';
			case GiftCardEventsEnum.BalanceReset:
				return 'Gift card balance was reset';
			case GiftCardEventsEnum.Bought:
				return 'Gift card was bought';
			case GiftCardEventsEnum.Deactivated:
				return 'Gift card was deactivated';
			case GiftCardEventsEnum.ExpiryDateUpdated:
				return 'Gift card expiry date was updated';
			case GiftCardEventsEnum.Issued:
				return 'Gift card was issued';
			case GiftCardEventsEnum.NoteAdded:
				return 'Gift card note was added';
			case GiftCardEventsEnum.Resent:
				return 'Gift card was resent';
			case GiftCardEventsEnum.SentToCustomer:
				return 'Gift card was sent to customer';
			case GiftCardEventsEnum.TagsUpdated:
				return 'Gift card tags was updated';
			case GiftCardEventsEnum.Updated:
				return 'Gift card was updated';
			case GiftCardEventsEnum.UsedInOrder:
				return 'Gift card was used';
			default:
				return '';
		}
	};

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
				'Successfully posted new note to giftcard',
			)
		)
			return;

		newNote = ''; // reset note
		eventsQuery.reexecute({ context: { requestPolicy: 'network-only' }, variables: { id } });
	};
</script>

{#if $eventsQuery.fetching}
	<SelectSkeleton size="sm" label />
{:else if $eventsQuery.error}
	<Alert size="sm" variant="error" bordered>{$eventsQuery.error.message}</Alert>
{:else if $eventsQuery.data?.giftCard?.events}
	<div class="flex gap-2 items-center">
		<div class="flex-3/4 flex items-center gap-2">
			<div class="avatar">
				<div class="w-9 rounded-lg">
					<img src={$READ_ONLY_USER_STORE?.avatar?.url} alt={$READ_ONLY_USER_STORE?.avatar?.alt} />
				</div>
			</div>
			<Input
				size="sm"
				placeholder="Add giftcard note"
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
				onclick={handleAddNote}>Submit</Button
			>
		</div>
	</div>

	<div class="relative w-full mx-auto p-4 bg-white dark:bg-gray-900 mt-3">
		<ol class="relative border-s border-gray-200 dark:border-gray-700">
			{#each $eventsQuery.data.giftCard.events as event, idx (idx)}
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
					<h3 class="mb-1 font-semibold dark:text-white text-gray-700">
						{giftcardTypeToHumanize(event.type)}
					</h3>
					<div class="text-sm font-normal leading-none text-gray-400 dark:text-gray-500 mb-1">
						{dayjs(event.date).fromNow()}
					</div>
					<div class="text-sm text-gray-600">
						By <a
							class="text-blue-600 text-sm font-semibold"
							href={AppRoute.SETTINGS_CONFIGS_STAFF_DETAILS(event.user?.id!)}>{byName}</a
						>
					</div>
				</li>
			{/each}
		</ol>
	</div>
{/if}
