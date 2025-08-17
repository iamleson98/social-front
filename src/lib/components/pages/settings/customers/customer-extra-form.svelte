<script lang="ts">
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import type { GiftCard, Query, User } from '$lib/gql/graphql';
	import { Badge } from '$lib/components/ui/Badge';
	import dayjs from 'dayjs';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { Modal } from '$lib/components/ui/Modal';
	import IssueForm from '../giftcards/issue-form.svelte';
	import { USER_GIFTCARDS_QUERY } from '$lib/api/admin/giftcards';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';

	type Props = {
		user: User;
	};

	let { user }: Props = $props();

	let openAddGiftcardModal = $state(false);
	let giftcardFormOk = $state(false);
	let triggerCreate = $state(false);

	const handleCreateGiftcardSuccess = () => {
		openAddGiftcardModal = false;
	};

	const UserGiftcardColumns: TableColumnProps<GiftCard>[] = [
		{
			title: 'Code',
			child: giftcardCode,
		},
		{
			title: 'Used at',
			child: lastUsedOn,
		},
	];
</script>

{#snippet giftcardCode({ item }: { item: GiftCard })}
	<span>{item.code}</span>
{/snippet}

{#snippet lastUsedOn({ item }: { item: GiftCard })}
	<span>{item.lastUsedOn ? dayjs(item.lastUsedOn).format(SitenameTimeFormat) : '-'}</span>
{/snippet}

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

	<Accordion class="bg-white rounded-lg border border-gray-200 p-3">
		{#snippet header()}
			<div class="flex items-center gap-2">
				<span>Gift cards</span>
				<Badge variant="outline" size="xs" text="Preview" rounded />
			</div>
		{/snippet}

		<GraphqlPaginableTable
			query={USER_GIFTCARDS_QUERY}
			variables={{
				id: user.id,
				first: 10,
			}}
			resultKey={'user.giftCards' as keyof Query}
			columns={UserGiftcardColumns}
		/>

		<Button size="xs" class="mt-3" onclick={() => (openAddGiftcardModal = true)}>
			Issue new card
		</Button>
	</Accordion>
</div>

<Modal
	open={openAddGiftcardModal}
	header="Issue new gift card"
	onClose={() => (openAddGiftcardModal = false)}
	onOk={() => (triggerCreate = true)}
	onCancel={() => (openAddGiftcardModal = false)}
	disableElements={!giftcardFormOk}
>
	<IssueForm
		toCustomerEmail={user.email}
		bind:formOk={giftcardFormOk}
		bind:triggerCreate
		onCreateSuccess={handleCreateGiftcardSuccess}
	/>
</Modal>
