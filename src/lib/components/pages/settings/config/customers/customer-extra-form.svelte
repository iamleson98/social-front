<script lang="ts">
	import { tranFunc } from '$i18n';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { type Address, type GiftCard } from '$lib/gql/graphql';
	import dayjs from 'dayjs';
	import { object, string, z } from 'zod';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt?: Date | string;
		giftCards: GiftCard[];
	};

	let { addresses, lastLoginTime, lastOrderAt, giftCards }: Props = $props();

	const formatDateLabel = (label: string, date: Date | string | undefined) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '_ _'}`;

	let isModalOpen = $state(false);
	const issueNewCard = () => {
		isModalOpen = true;
	};

	let giftCard = $state<GiftCard>({
		code: '',
		tags: [],
		id: '',
		metadata: [],
		privateMetadata: [],
		created: new Date(),
		currentBalance: {
			amount: 0,
			currency: ''
		},
		displayCode: '',
		events: [],
		initialBalance: {
			amount: 0,
			currency: ''
		},
		isActive: false,
		last4CodeChars: ''
	});
	let ok = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const customerSchema = object({
		amount: string().nonempty(REQUIRED_ERROR),
		currency: string().nonempty(REQUIRED_ERROR)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;

	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});

	const validate = () => {
		const result = customerSchema.safeParse({
			amount: giftCard.currentBalance.amount,
			currency: giftCard.currentBalance.currency
		});
		if (!result.success) {
			customerFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};

	const issueNewCardClick = () => {
		if (!validate()) return;
		isModalOpen = false;
	};
</script>

<div class="flex flex-col gap-3 flex-1 w-4/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Address information">
			{#if addresses.length > 0}
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
			<div class="flex flex-col gap-2">
				<span class="text-sm">{formatDateLabel('Last login', lastLoginTime)}</span>
				<span class="text-sm">{formatDateLabel('Last order', lastOrderAt)}</span>
			</div>
		</Accordion>
	</div>

	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Gift cards">
			{#if giftCards.length > 0}
				{#each giftCards as giftCard, idx (idx)}
					<div class="flex flex-col gap-2">
						<p>{giftCard.code}</p>
						<p>{giftCard.events}</p>
					</div>
				{/each}
			{:else}
				<Alert variant="info" size="sm" bordered
					>There are no gift cards used by this customer</Alert
				>
			{/if}
			<Button size="xs" class="mt-3" onclick={issueNewCard}>Issue new card</Button>
		</Accordion>
	</div>
</div>

<Modal
	open={isModalOpen}
	header="Issue new gift card"
	onCancel={() => (isModalOpen = false)}
	size="xs"
	onOk={issueNewCardClick}
>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-3">
			<Input
				label="Amount"
				bind:value={giftCard.currentBalance.amount}
				required
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.amount?.length ? 'error' : 'info'}
				subText={customerFormErrors.amount?.length ? customerFormErrors.amount[0] : undefined}
			/>
			<Input
				label="Currency"
				bind:value={giftCard.currentBalance.currency}
				required
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.amount?.length ? 'error' : 'info'}
				subText={customerFormErrors.amount?.length ? customerFormErrors.amount[0] : undefined}
			/>
		</div>
		<Input
			label="Tag"
			bind:value={giftCard.tags}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.amount?.length ? 'error' : 'info'}
			subText={customerFormErrors.amount?.length ? customerFormErrors.amount[0] : undefined}
		/>
		<Input
			label="Customer"
			bind:value={giftCard.currentBalance.amount}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.amount?.length ? 'error' : 'info'}
			subText={customerFormErrors.amount?.length ? customerFormErrors.amount[0] : undefined}
		/>
		<Checkbox label="Active" bind:checked={giftCard.isActive} />
	</div>
</Modal>
