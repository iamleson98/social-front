<script lang="ts">
	import { tranFunc } from '$i18n';
	import dayjs from 'dayjs';
	import { object, string, z } from 'zod';

	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';

	import type { Address, GiftCard } from '$lib/gql/graphql';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt?: Date | string;
		giftCards: GiftCard[];
	};

	let { addresses, lastLoginTime, lastOrderAt, giftCards }: Props = $props();

	const formatDate = (label: string, date: Date | string | undefined) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '_ _'}`;

	let isModalOpen = $state(false);
	let ok = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const customerSchema = object({
		amount: string().nonempty(REQUIRED_ERROR),
		currency: string().nonempty(REQUIRED_ERROR)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	let giftCard = $state<GiftCard>({
		code: '',
		tags: [],
		id: '',
		metadata: [],
		privateMetadata: [],
		created: new Date(),
		currentBalance: { amount: 0, currency: '' },
		displayCode: '',
		events: [],
		initialBalance: { amount: 0, currency: '' },
		isActive: false,
		last4CodeChars: ''
	});

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});

	const validate = () => {
		const result = customerSchema.safeParse({
			amount: giftCard.currentBalance.amount,
			currency: giftCard.currentBalance.currency
		});
		customerFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const issueNewCard = () => (isModalOpen = true);
	const issueNewCardClick = () => validate() && (isModalOpen = false);
</script>

<div class="flex flex-col gap-3 flex-1 w-4/10">
	<div class="bg-white rounded-lg border border-gray-200 p-3">
		<Accordion header="Address information">
			{#if addresses.length}
				{#each addresses as address, idx (idx)}
					<UserAddress {address} class="w-full mb-3" />
				{/each}
			{:else}
				<Alert variant="info" size="sm" bordered>
					This customer has no address
				</Alert>
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
			<Button size="xs" class="mt-3" onclick={issueNewCard}>Issue new card</Button>
		</Accordion>
	</div>
</div>

<Modal
	open={isModalOpen}
	header="Issue new gift card"
	size="xs"
	onCancel={() => (isModalOpen = false)}
	onOk={issueNewCardClick}
>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row gap-3 items-start">
			<Input
				label="Amount"
				bind:value={giftCard.currentBalance.amount}
				required
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.amount?.length ? 'error' : 'info'}
				subText={customerFormErrors.amount?.[0]}
			/>
			<Input
				label="Currency"
				bind:value={giftCard.currentBalance.currency}
				required
				inputDebounceOption={{ onInput: validate }}
				onblur={validate}
				variant={customerFormErrors.currency?.length ? 'error' : 'info'}
				subText={customerFormErrors.currency?.[0]}
			/>
		</div>

		<Input
			label="Tag"
			bind:value={giftCard.tags}
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
		/>
		<Input
			label="Customer"
			required
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
		/>
		<Checkbox label="Active" bind:checked={giftCard.isActive} />
	</div>
</Modal>
