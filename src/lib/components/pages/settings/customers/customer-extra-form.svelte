<script lang="ts">
	import { tranFunc } from '$i18n';
	import { USER_GIFTCARDS_QUERY } from '$lib/api/admin/giftcards';
	import UserAddress from '$lib/components/common/user-address/user-address.svelte';
	import { Button } from '$lib/components/ui';
	import { Accordion } from '$lib/components/ui/Accordion';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { GiftCard, Query, User } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import IssueForm from '../giftcards/issue-form.svelte';
	import dayjs from 'dayjs';
	import { toast } from 'svelte-sonner';

	type Props = {
		user: User;
		disabled?: boolean;
	};

	let { user, disabled }: Props = $props();

	let openAddGiftcardModal = $state(false);
	let giftcardFormOk = $state(false);
	let triggerCreate = $state(false);
	let loading = $state(false);

	const UserGiftcardColumns: TableColumnProps<GiftCard>[] = [
		{
			title: $tranFunc('common.code'),
			child: giftcardCode,
		},
		{
			title: $tranFunc('giftcard.usedAt'),
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
	<Accordion header={$tranFunc('customer.addrInfo')} class={SitenameCommonClassName}>
		{#if user.addresses.length}
			{#each user.addresses as address, idx (idx)}
				<UserAddress {address} class="w-full mb-2" />
			{/each}
		{:else}
			<Alert variant="info" size="sm" bordered>{$tranFunc('customer.hasNoAddr')}</Alert>
		{/if}
	</Accordion>

	<Accordion header={$tranFunc('customer.history')} class={SitenameCommonClassName}>
		<div class="flex flex-col gap-2 text-sm">
			<span>
				{$tranFunc('customer.lastLogin')}: {user.lastLogin
					? dayjs(user.lastLogin).format(SitenameTimeFormat)
					: '-'}
			</span>
			<span>
				{$tranFunc('customer.lastOrder')}: {user.orders?.edges[0]?.node?.created
					? dayjs(user.orders?.edges[0]?.node?.created).format(SitenameTimeFormat)
					: '-'}
			</span>
		</div>
	</Accordion>

	<Accordion class={SitenameCommonClassName}>
		{#snippet header()}
			<div class="flex items-center gap-2">
				<span>{$tranFunc('customer.giftcards')}</span>
				<Badge variant="outline" size="xs" text={$tranFunc('settings.preview')} rounded />
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
			{disabled}
			autoRefetchOnVariableChange
		/>

		<Button size="xs" class="mt-3" onclick={() => (openAddGiftcardModal = true)} {disabled}>
			{$tranFunc('giftcard.newIssue')}
		</Button>
	</Accordion>
</div>

<Modal
	open={openAddGiftcardModal}
	header={$tranFunc('giftcard.newIssue')}
	onClose={() => (openAddGiftcardModal = false)}
	onOk={() => (triggerCreate = true)}
	onCancel={() => (openAddGiftcardModal = false)}
	disableElements={!giftcardFormOk || loading}
	closeOnEscape
	closeOnOutsideClick
>
	<IssueForm
		toCustomerEmail={user.email}
		bind:formOk={giftcardFormOk}
		bind:triggerCreate
		onCreateSuccess={() => {
			openAddGiftcardModal = false;
			toast.success($CommonState.CreateSuccess);
		}}
		bind:loading
	/>
</Modal>
