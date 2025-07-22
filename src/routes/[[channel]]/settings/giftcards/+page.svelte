<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { GIFTCARD_LIST_QUERY } from '$lib/api/admin/giftcards';
	import { GIFT_CARD_DELETE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Cancel, CircleCheck, Dots, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/giftcards/filter.svelte';
	import GiftcardIssueForm from '$lib/components/pages/settings/giftcards/giftcard-issue-form.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/giftcards/utils.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import {
		GiftCardSortField,
		type GiftCard,
		type Mutation,
		type MutationGiftCardDeleteArgs,
		type QueryGiftCardsArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError, formatCurrency } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const giftcardUtil = new GiftcardUtil();
	let forceReExecuteGraphqlQuery = $state(true);
	let variables = $state<QueryGiftCardsArgs>({ first: 10, search: '' });
	let openGiftcardIssueForm = $state(false);
	let loading = $state(false);

	const COLUMNS: TableColumnProps<GiftCard, GiftCardSortField>[] = [
		{
			title: 'Code',
			child: code,
		},
		{
			title: 'Status',
			child: status,
		},
		{
			title: 'Tags',
			child: tags,
		},
		{
			title: 'Product',
			child: product,
		},
		{
			title: 'Balance',
			child: balance,
		},
		{
			title: 'Issued at',
			key: GiftCardSortField.CreatedAt,
			child: issueAt,
		},
		{
			title: 'Action',
			child: action,
		},
	];

	afterNavigate(() => {
		const action = page.url.searchParams.get('action');
		openGiftcardIssueForm = action === 'create';
	});

	const handleDeleteGiftcard = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure to delete the gift card ${id}?`,
			onOk: async () => {
				loading = true; //
				const result = await GRAPHQL_CLIENT.mutation<
					Mutation['giftCardDelete'],
					MutationGiftCardDeleteArgs
				>(GIFT_CARD_DELETE_MUTATION, {
					id,
				});

				loading = false; //

				if (
					checkIfGraphqlResultHasError(
						result,
						'giftCardDelete',
						`Successfully deleted giftcard ${id}`,
					)
				)
					return;

				forceReExecuteGraphqlQuery = true; // trigger refetching table data
			},
		});
	};

	const handleToggleGiftcardStatus = async (id: string, active: boolean) => {
		loading = true;
		const hasErr = await giftcardUtil.handleToggleGiftcardStatus(id, active);
		loading = false;
		if (!hasErr) forceReExecuteGraphqlQuery = true;
	};
</script>

{#snippet code({ item }: { item: GiftCard })}
	<a href={AppRoute.SETTINGS_CONFIGS_GIFTCARD_DETAIL(item.id)} class="link">
		••••-{item.displayCode}
	</a>
{/snippet}

{#snippet tags({ item }: { item: GiftCard })}
	{#each item.tags as tag, idx (idx)}
		<Badge text={tag.name} size="xs" variant="light" color="gray" /> <br />
	{/each}
{/snippet}

{#snippet balance({ item }: { item: GiftCard })}
	<div class="flex items-center justify-between gap-1">
		<span class="text-gray-500 text-xs">{item.currentBalance.currency}</span>
		<span class="font-semibold text-blue-600 text-right">
			{formatCurrency(item.currentBalance.amount)}
		</span>
	</div>
{/snippet}

{#snippet product({ item }: { item: GiftCard })}
	{#if item.product}
		<a href={AppRoute.PRODUCT_DETAILS(item.product.slug)} class="link">{item.product.name}</a>
	{:else}
		<span>-</span>
	{/if}
{/snippet}

{#snippet action({ item }: { item: GiftCard })}
	{#snippet trigger({ onclick }: DropdownTriggerInterface)}
		<IconButton icon={Dots} {onclick} size="xs" color="gray" variant="light" disabled={loading} />
	{/snippet}
	<DropDown {trigger}>
		<MenuItem
			startIcon={Trash}
			onclick={() => handleDeleteGiftcard(item.id)}
			class="text-red-600"
			disabled={loading}
		>
			Delete
		</MenuItem>
		<MenuItem
			disabled={loading}
			startIcon={item.isActive ? Cancel : CircleCheck}
			onclick={() => handleToggleGiftcardStatus(item.id, !item.isActive)}
			class={item.isActive ? 'text-gray-600' : 'text-green-600'}
		>
			{item.isActive ? 'Deactivate' : 'Activate'}
		</MenuItem>
	</DropDown>
{/snippet}

{#snippet issueAt({ item }: { item: GiftCard })}
	<span>{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

{#snippet status({ item }: { item: GiftCard })}
	<Badge
		text={item.isActive ? 'Active' : 'Disabled'}
		size="sm"
		variant="filled"
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

<Filter bind:variables bind:forceReExecuteGraphqlQuery />

<GraphqlPaginableTable
	query={GIFTCARD_LIST_QUERY}
	bind:forceReExecuteGraphqlQuery
	resultKey="giftCards"
	bind:variables
	columns={COLUMNS}
	disabled={loading}
	class="bg-white rounded-lg border border-gray-200 p-3"
/>

<GiftcardIssueForm
	bind:open={openGiftcardIssueForm}
	onSuccess={() => (forceReExecuteGraphqlQuery = true)}
/>
