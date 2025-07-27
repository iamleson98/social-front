<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { User } from '$lib/gql/graphql';
	import { Badge } from '$lib/components/ui/badge';
	import GiftcardIssueForm from '../giftcards/giftcard-issue-form.svelte';
	import dayjs from 'dayjs';
	import { SitenameTimeFormat } from '$lib/utils/consts';

	type Props = {
		user: User;
	};

	let { user }: Props = $props();

	let isAddCardModalOpen = $state(false);
</script>

<div class="flex flex-col gap-2 flex-1 w-4/10">
	<Accordion header="Address information" class="bg-white rounded-lg border border-gray-200 p-3">
		{#if user.addresses.length}
			{#each user.addresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-2" />
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>This customer has no address</Alert>
		{/if}
	</Accordion>

	<Accordion header="Customer history" class="bg-white rounded-lg border border-gray-200 p-3">
		<div class="flex flex-col gap-2 text-sm">
			<span>
				Last login: {user.lastLogin ? dayjs(user.lastLogin).format(SitenameTimeFormat) : '-'}
			</span>
			<span>
				Last order: {user.orders?.edges[0]?.node?.created
					? dayjs(user.orders?.edges[0]?.node?.created).format(SitenameTimeFormat)
					: '-'}
			</span>
		</div>
	</Accordion>

	{#snippet previewHeader()}
		<div class="flex items-center gap-2">
			<span>Gift cards</span>
			<Badge variant="outline" size="xs" text="Preview" rounded />
		</div>
	{/snippet}

	<Accordion header={previewHeader} class="bg-white rounded-lg border border-gray-200 p-3">
		{#if user.giftCards?.edges?.length}
			{#each user.giftCards?.edges as card, idx (idx)}
				<div class="flex flex-col gap-2">
					<p>{card.node.code}</p>
					<p>{card.node.events}</p>
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

<GiftcardIssueForm bind:open={isAddCardModalOpen} toCustomerEmail={user.email} />
