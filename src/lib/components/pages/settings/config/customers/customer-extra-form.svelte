<script lang="ts">
	import { tranFunc } from '$i18n';
	import dayjs from 'dayjs';
	import { array, number, object, string, z } from 'zod';

	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';

	import type {
		Address,
		Channel,
		GiftCard,
		GiftCardCreateInput,
		GiftCardTag,
		Mutation,
		MutationGiftCardCreateArgs,
		Query
	} from '$lib/gql/graphql';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { GIFT_CARD_CREATE_MUTATION, GIFT_CARD_TAGS_QUERY } from '$lib/api/admin/users';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { CHANNELS } from '$lib/utils/channels';
	import { Badge } from '$lib/components/ui/badge';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt?: string;
		giftCards: GiftCard[];
		userGmail: string;
		userName: string;
	};

	let { addresses, lastLoginTime, lastOrderAt, giftCards, userGmail, userName }: Props = $props();

	const formatDate = (label: string, date?: string) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '_ _'}`;

	let isAddCardModalOpen = $state(false);
	let isNewCardModalOpen = $state(false);
	let newCardId = $state('');
	let ok = $state(false);
	let loading = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const customerSchema = object({
		amount: number(),
		currency: string().nonempty(REQUIRED_ERROR),
		channel: string().nonempty(REQUIRED_ERROR),
		note: string().nonempty(REQUIRED_ERROR),
		addTags: array(string()).nonempty(REQUIRED_ERROR)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});
	let selectedTagOptions = $state<SelectOption[]>([]);

	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: userGmail,
		channel: '',
		balance: {
			amount: 0,
			currency: ''
		},
		isActive: false,
		note: ''
	});

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});

	const currencyOptions = Array.from(new Set(CHANNELS.map((chan) => chan.currency))).map(
		(code) => ({
			value: code,
			label: code
		})
	);

	const validate = () => {
		const parseResult = customerSchema.safeParse({
			amount: Number(giftCardInput.balance.amount),
			currency: giftCardInput.balance.currency,
			addTags: giftCardInput.addTags,
			channel: giftCardInput.channel,
			note: giftCardInput.note
		});
		if (!parseResult.success) {
			customerFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};

	const openAddCardModal = () => (isAddCardModalOpen = true);
	

	const queryChannel = operationStore<Pick<Query, 'channels'>, Channel[]>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'network-only'
	});

	const queryGiftCardTags = operationStore<Pick<Query, 'giftCardTags'>, GiftCardTag[]>({
		kind: 'query',
		query: GIFT_CARD_TAGS_QUERY,
		requestPolicy: 'network-only',
		variables: {
			first: 20
		}
	});

	const handleAddTags = (options?: SelectOption[]) => {
		if (!options) return;
		const selectedIds = options.map((opt) => opt.label);
		giftCardInput.addTags = selectedIds;
	};
</script>

<div class="flex flex-col gap-2 flex-1 w-4/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Address information">
			{#if addresses.length}
				{#each addresses as address, idx (idx)}
					<UserAddress {address} class="w-full mb-2" />
				{/each}
			{:else}
				<Alert variant="info" size="sm" bordered>This customer has no address</Alert>
			{/if}
		</Accordion>
	</div>

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Customer history">
			<div class="flex flex-col gap-2 text-sm">
				<span>{formatDate('Last login', lastLoginTime)}</span>
				<span>{formatDate('Last order', lastOrderAt)}</span>
			</div>
		</Accordion>
	</div>

	{#snippet previewHeader()}
		<div class="flex items-center gap-2">
			<span>Gift cards</span>
			<Badge variant="outline" size="xs" text="Preview" rounded />
		</div>
	{/snippet}

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header={previewHeader}>
			{#if giftCards.length}
				{#each giftCards as card, idx (idx)}
					<div class="flex flex-col gap-2">
						<p>{card.code}</p>
						<p>{card.events}</p>
					</div>
				{/each}
			{:else}
				<Alert variant="info" size="sm" bordered>
					There are no gift cards used by this customer
				</Alert>
			{/if}

			<Button size="xs" class="mt-3" onclick={openAddCardModal}>Issue new card</Button>
		</Accordion>
	</div>
</div>