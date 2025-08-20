<script lang="ts">
	import { GIFTCARD_LIST_QUERY } from '$lib/api/admin/giftcards';
	import { GIFT_CARD_DELETE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Cancel, CircleCheck, Dots, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/giftcards/filter.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/giftcards/utils.svelte';
	import { Badge } from '$lib/components/ui/Badge';
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
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const giftcardUtil = new GiftcardUtil();
	let forceReExecuteGraphqlQuery = $state(true);
	let variables = $state<QueryGiftCardsArgs>({ first: 10, search: '' });
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
			title: 'Balance',
			child: balance,
			key: GiftCardSortField.CurrentBalance,
		},
		{
			title: 'Issued at',
			key: GiftCardSortField.CreatedAt,
			child: issueAt,
		},
		{
			title: 'Used at',
			child: usedAt,
		},
		{
			title: 'Action',
			child: action,
		},
	];

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
	<PriceDisplay {...item.currentBalance} />
{/snippet}

{#snippet usedAt({ item }: { item: GiftCard })}
	{item.lastUsedOn ? dayjs(item.lastUsedOn).format(SitenameTimeFormat) : '-'}
{/snippet}

{#snippet action({ item }: { item: GiftCard })}
	<DropDown>
		{#snippet trigger({ onclick }: DropdownTriggerInterface)}
			<IconButton icon={Dots} {onclick} size="xs" color="gray" variant="light" disabled={loading} />
		{/snippet}
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

<div class="mb-2">
	<Filter bind:variables bind:forceReExecuteGraphqlQuery />
</div>

<GraphqlPaginableTable
	query={GIFTCARD_LIST_QUERY}
	bind:forceReExecuteGraphqlQuery
	resultKey="giftCards"
	bind:variables
	columns={COLUMNS}
	disabled={loading}
/>
