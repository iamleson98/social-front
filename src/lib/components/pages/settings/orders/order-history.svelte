<script lang="ts">
	import { ORDER_ADD_NOTE_MUTATION, ORDER_HISTORY_QUERY } from '$lib/api/admin/orders';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import { CalendarClock, Send } from '$lib/components/icons';
	import { Alert } from '$lib/components/ui/Alert';
	import { Button, IconButton } from '$lib/components/ui/Button';
	import { Input } from '$lib/components/ui/Input';
	import { Select, SelectSkeleton, type SelectOption } from '$lib/components/ui/select';
	import {
		OrderEventsEnum,
		type Mutation,
		type MutationOrderAddNoteArgs,
		type Query,
		type QueryOrderArgs,
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
	let filterType = $state<OrderEventsEnum>();
	const filterTypeOptions = Object.values(OrderEventsEnum).map<SelectOption>((key) => ({
		value: key,
		label: key.toLowerCase().replace(/_/g, ' '),
	}));

	const eventsQuery = operationStore<Pick<Query, 'order'>, QueryOrderArgs>({
		kind: 'query',
		query: ORDER_HISTORY_QUERY,
		variables: { id },
	});

	const orderHistoryTypeToHumanize = (type?: OrderEventsEnum | null) => {
		switch (type) {
			case OrderEventsEnum.AddedProducts:
				return 'Order was added products';
			case OrderEventsEnum.Canceled:
				return 'Order was canceled';
			case OrderEventsEnum.Confirmed:
				return 'Order was confirmed';
			case OrderEventsEnum.DraftCreated:
				return 'Order was draft created';
			case OrderEventsEnum.Expired:
				return 'Order was expired';
			case OrderEventsEnum.NoteAdded:
				return 'Order note was added';
			case OrderEventsEnum.NoteUpdated:
				return 'Order note was updated';
			default:
				return '';
		}
	};

	const handleAddNote = async () => {
		if (!newNote) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'orderAddNote'>,
			MutationOrderAddNoteArgs
		>(ORDER_ADD_NOTE_MUTATION, {
			input: {
				message: newNote,
			},
			order: id,
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(result, 'orderAddNote', 'Successfully posted new note to order')
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
{:else if $eventsQuery.data}
	{@const events =
		$eventsQuery.data.order?.events
			.filter((event) => (filterType ? event.type === filterType : true))
			.sort(
				(a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(), // latest first
			) || []}
	<div class="bg-white rounded p-3">
		<!-- MARK: note form -->
	<div class="flex gap-2 items-center">
		<div class="flex-3/4 flex items-center gap-2">
			<div class="avatar">
				<div class="w-9 rounded-lg">
					<img src={$READ_ONLY_USER_STORE?.avatar?.url} alt={$READ_ONLY_USER_STORE?.avatar?.alt} />
				</div>
			</div>
			<Input
				size="sm"
				placeholder="Add note"
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
				disabled={!newNote?.trim() || loading}
				onclick={handleAddNote}>Send</Button
			>
		</div>
	</div>

	<!-- MARK: event history -->
	<div class="relative w-full mx-auto dark:bg-gray-900 mt-5">
		<ol class="relative mt-2 ml-5 border-s border-gray-200 dark:border-gray-700">
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
						{orderHistoryTypeToHumanize()}
					</div>
					<div class="text-xs font-normal leading-none text-gray-400 dark:text-gray-500 mb-1">
						{dayjs(event.date).fromNow()}
					</div>
					{#if event.type === OrderEventsEnum.NoteAdded}
						<div class="border-l-4 border-gray-200 p-2 bg-gray-50 text-gray-600 text-sm mb-1">
							<span>{event.message}</span>
						</div>
					{/if}
					<div class="text-xs text-gray-600">
						By <a
							class="text-blue-600 text-sm font-semibold"
							href={AppRoute.SETTINGS_ORDERS_DETAILS(id)}>{byName}</a
						>
					</div>
				</li>
			{/each}
		</ol>
	</div>
	</div>
{/if}
