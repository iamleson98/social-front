<script lang="ts">
	import { tranFunc } from '$i18n';
	import dayjs from 'dayjs';
	import { number, object, string, z } from 'zod';

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
		Mutation,
		MutationGiftCardCreateArgs,
		Query
	} from '$lib/gql/graphql';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { GIFT_CARD_CREATE_MUTATION } from '$lib/api/admin/users';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { CHANNELS_QUERY } from '$lib/api/channels';
	import { operationStore } from '$lib/api/operation';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { CHANNELS } from '$lib/utils/channels';
	import { Badge } from '$lib/components/ui/Badge';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt?: Date | string;
		giftCards: GiftCard[];
		userGmail: string;
		userName: string;
	};

	let { addresses, lastLoginTime, lastOrderAt, giftCards, userGmail, userName }: Props = $props();

	const formatDate = (label: string, date: Date | string | undefined) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '_ _'}`;

	let isAddCardModalOpen = $state(false);
	let isNewCardModalOpen = $state(false);
	let newCardId = $state('');
	let ok = $state(false);
	let loading = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const customerSchema = object({
		amount: number().nonnegative(REQUIRED_ERROR),
		currency: string().nonempty(REQUIRED_ERROR),
		channel: string().nonempty(REQUIRED_ERROR),
		note: string().nonempty(REQUIRED_ERROR),
		addTags: string().nonempty(REQUIRED_ERROR)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	let giftCardInput = $state<GiftCardCreateInput>({
		addTags: [],
		userEmail: userGmail,
		channel: '',
		balance: {
			amount: '',
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
		const result = customerSchema.safeParse({
			amount: giftCardInput.balance.amount,
			currency: giftCardInput.balance.currency,
			channel: giftCardInput.channel,
			note: giftCardInput.note,
			addTags: giftCardInput.addTags
		});
		customerFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const openAddCardModal = () => (isAddCardModalOpen = true);
	const addNewCard = async () => {
		if (!validate()) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'giftCardCreate'>,
			MutationGiftCardCreateArgs
		>(GIFT_CARD_CREATE_MUTATION, {
			input: {
				addTags: giftCardInput.addTags || [],
				userEmail: giftCardInput.userEmail,
				channel: giftCardInput.channel,
				balance: {
					amount: parseFloat(giftCardInput.balance.amount),
					currency: giftCardInput.balance.currency
				},
				isActive: giftCardInput.isActive,
				note: giftCardInput.note
			}
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'giftCardCreate', 'Gift card created successfully')) {
			return;
		}
		newCardId = (result.data?.giftCardCreate?.giftCard?.id as string).slice(0, -1);
		isAddCardModalOpen = false;
		isNewCardModalOpen = true;
	};

	const queryChannel = operationStore<Pick<Query, 'channels'>, Channel[]>({
		kind: 'query',
		query: CHANNELS_QUERY,
		requestPolicy: 'network-only'
	});
</script>

<div class="flex flex-col gap-3 flex-1 w-4/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Address information">
			{#if addresses.length}
				{#each addresses as address, idx (idx)}
					<UserAddress {address} class="w-full mb-3" />
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

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Gift cards">
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
			<Badge variant="outline" size="xs" text="Preview" color="cyan" />
			<Button size="xs" class="mt-3" onclick={openAddCardModal}>Issue new card</Button>
		</Accordion>
	</div>
</div>

<Modal
	open={isAddCardModalOpen}
	header="Issue new gift card"
	size="xs"
	onCancel={() => (isAddCardModalOpen = false)}
	onOk={addNewCard}
>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-3 items-start">
			<Input
				label="Amount"
				bind:value={giftCardInput.balance.amount}
				required
				type="number"
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.amount?.length ? 'error' : 'info'}
				subText={customerFormErrors.amount?.[0]}
			/>
			<Select
				label="Currency"
				options={currencyOptions}
				placeholder="Select a currency"
				bind:value={giftCardInput.balance.currency}
				required
				onchange={validate}
				onblur={validate}
				variant={customerFormErrors.currency?.length ? 'error' : 'info'}
				subText={customerFormErrors.currency?.[0]}
			/>
		</div>

		<Input
			label="Tag"
			bind:value={giftCardInput.addTags}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.addTags?.length ? 'error' : 'info'}
			subText={customerFormErrors.addTags?.[0]}
		/>
		<Input label="Customer" value={userName} disabled />
		<Select
			label="Channel"
			options={$queryChannel.data?.channels?.map<SelectOption>((channel) => ({
				value: channel.id,
				label: channel.name
			})) ?? []}
			placeholder="Select a channel"
			bind:value={giftCardInput.channel as string | undefined}
			required
			onchange={validate}
			onblur={validate}
			variant={customerFormErrors.channel?.length ? 'error' : 'info'}
			subText={customerFormErrors.channel?.[0]}
		/>

		<Input
			label="Note"
			bind:value={giftCardInput.note}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.note?.length ? 'error' : 'info'}
			subText={customerFormErrors.note?.[0]}
		/>
		<Checkbox label="Active" bind:checked={giftCardInput.isActive} />
	</div>
</Modal>

<Modal
	open={isNewCardModalOpen}
	header="Issue gift card"
	size="xs"
	onCancel={() => (isNewCardModalOpen = false)}
	onOk={() => (isNewCardModalOpen = false)}
>
	<p>This is the code of a created gift card:</p>
	<p class="text-lg mt-2 text-gray-800 font-semibold">{newCardId}</p>
</Modal>
