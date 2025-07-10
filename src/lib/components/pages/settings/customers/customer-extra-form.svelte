<script lang="ts">
	import { tranFunc } from '$i18n';
	import dayjs from 'dayjs';
	import { array, number, object, string, z } from 'zod';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { Address, GiftCard } from '$lib/gql/graphql';
	import { Badge } from '$lib/components/ui/badge';
	import GiftcardIssueForm from '../giftcards/giftcard-issue-form.svelte';

	type Props = {
		addresses: Address[];
		lastLoginTime: string;
		lastOrderAt?: string;
		giftCards: GiftCard[];
		userEmail: string;
		userName: string;
	};

	let { addresses, lastLoginTime, lastOrderAt, giftCards, userEmail, userName }: Props = $props();

	const formatDate = (label: string, date?: string) =>
		`${label}: ${date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '_ _'}`;

	let isAddCardModalOpen = $state(false);
	let ok = $state(false);

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const customerSchema = object({
		amount: number(),
		currency: string().nonempty(REQUIRED_ERROR),
		channel: string().nonempty(REQUIRED_ERROR),
		note: string().nonempty(REQUIRED_ERROR),
		addTags: array(string()).nonempty(REQUIRED_ERROR),
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});
</script>

<div class="flex flex-col gap-2 flex-1 w-4/10">
	<Accordion header="Address information" class="bg-white rounded-lg border border-gray-200 p-3">
		{#if addresses.length}
			{#each addresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-2" />
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no address</Alert>
		{/if}
	</Accordion>

	<Accordion header="Customer history" class="bg-white rounded-lg border border-gray-200 p-3">
		<div class="flex flex-col gap-2 text-sm">
			<span>{formatDate('Last login', lastLoginTime)}</span>
			<span>{formatDate('Last order', lastOrderAt)}</span>
		</div>
	</Accordion>

	{#snippet previewHeader()}
		<div class="flex items-center gap-2">
			<span>Gift cards</span>
			<Badge variant="outline" size="xs" text="Preview" rounded />
		</div>
	{/snippet}

	<Accordion header={previewHeader} class="bg-white rounded-lg border border-gray-200 p-3">
		{#if giftCards.length}
			{#each giftCards as card, idx (idx)}
				<div class="flex flex-col gap-2">
					<p>{card.code}</p>
					<p>{card.events}</p>
				</div>
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>There are no gift cards used by this customer</Alert>
		{/if}

		<Button size="xs" class="mt-3" onclick={() => (isAddCardModalOpen = true)}>
			Issue new card
		</Button>
	</Accordion>
</div>

<GiftcardIssueForm bind:open={isAddCardModalOpen} toCustomerEmail={userEmail} />
