<script lang="ts">
	import { GIFTCARD_LIST_QUERY } from '$lib/api/admin/giftcards';
	import { GIFT_CARD_DELETE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Cancel, CircleCheck, Dots, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/giftcards/filter.svelte';
	import Settings from '$lib/components/pages/settings/giftcards/settings.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/giftcards/utils.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Checkbox } from '$lib/components/ui/Input';
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
	let giftcardFilterVariables = $state<QueryGiftCardsArgs>({
		first: 10,
		filter: { isActive: true || false },
	});
	let loading = $state(false);
	let selectedGiftcards = $state<Record<string, boolean>>({});

	const COLUMNS: TableColumnProps<GiftCard, GiftCardSortField>[] = [
		{
			title: selectAll,
			child: itemSelect,
		},
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

{#snippet selectAll({ items }: { items: GiftCard[] })}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => {
			if (checked) selectedGiftcards = Object.fromEntries(items.map((item) => [item.id, true]));
			else selectedGiftcards = {};
		}}
		checked={items.length === Object.keys(selectedGiftcards).length}
	/>
{/snippet}

{#snippet itemSelect({ item }: { item: GiftCard })}
	<Checkbox
		size="sm"
		onCheckChange={(checked) => {
			if (checked) selectedGiftcards[item.id] = true;
			else delete selectedGiftcards[item.id];
		}}
		checked={selectedGiftcards[item.id]}
	/>
{/snippet}

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

<div class="flex items-center justify-between mb-2">
	<Filter bind:variables={giftcardFilterVariables} bind:forceReExecuteGraphqlQuery />
	<Settings bind:variables={giftcardFilterVariables} bind:selectedIds={selectedGiftcards} />
</div>

<GraphqlPaginableTable
	query={GIFTCARD_LIST_QUERY}
	bind:forceReExecuteGraphqlQuery
	resultKey="giftCards"
	bind:variables={giftcardFilterVariables}
	columns={COLUMNS}
	disabled={loading}
/>
