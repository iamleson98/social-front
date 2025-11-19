<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		GIFT_CARD_BULK_ACTIVATE_MUTATION,
		GIFT_CARD_BULK_DEACTIVATE_MUTATION,
		GIFT_CARD_BULK_DELETE_MUTATION,
		GIFTCARD_LIST_QUERY,
	} from '$lib/api/admin/giftcards';
	import { GIFT_CARD_DELETE_MUTATION } from '$lib/api/admin/giftcards';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import PriceDisplay from '$lib/components/common/price-display.svelte';
	import { Ban, Cancel, CircleCheck, Dots, Trash } from '$lib/components/icons';
	import Filter from '$lib/components/pages/settings/giftcards/filter.svelte';
	import Settings from '$lib/components/pages/settings/giftcards/settings.svelte';
	import { GiftcardUtil } from '$lib/components/pages/settings/giftcards/utils.svelte';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import Button from '$lib/components/ui/Button/Button.svelte';
	import { DropDown, MenuItem } from '$lib/components/ui/Dropdown';
	import { Checkbox } from '$lib/components/ui/Input';
	import {
		GraphqlPaginableTable,
		type GraphqlPaginableTableInterface,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import {
		GiftCardSortField,
		type GiftCard,
		type Mutation,
		type MutationGiftCardBulkActivateArgs,
		type MutationGiftCardBulkDeactivateArgs,
		type MutationGiftCardBulkDeleteArgs,
		type MutationGiftCardDeleteArgs,
		type QueryGiftCardsArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';

	const giftcardUtil = new GiftcardUtil();
	let giftcardFilterVariables = $state<QueryGiftCardsArgs>({
		first: 10,
		filter: {},
	});
	let loading = $state(false);
	let selectedGiftcards = $state<Record<string, boolean>>({});
	let tableRef = $state<GraphqlPaginableTableInterface>();

	const COLUMNS: TableColumnProps<GiftCard, GiftCardSortField>[] = $derived([
		{
			title: selectAll,
			child: itemSelect,
		},
		{
			title: $tranFunc('giftcard.code'),
			child: code,
		},
		{
			title: $tranFunc('settings.status'),
			child: status,
		},
		{
			title: $tranFunc('giftcard.form.tags'),
			child: tags,
		},
		{
			title: $tranFunc('giftcard.balance'),
			child: balance,
			key: GiftCardSortField.CurrentBalance,
		},
		{
			title: $tranFunc('giftcard.issueAt'),
			key: GiftCardSortField.CreatedAt,
			child: issueAt,
		},
		{
			title: $tranFunc('giftcard.usedAt'),
			child: usedAt,
		},
		{
			title: $tranFunc('common.action'),
			child: action,
		},
	]);

	const handleDeleteGiftcard = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true; //
				const result = await GRAPHQL_CLIENT.mutation<
					Mutation['giftCardDelete'],
					MutationGiftCardDeleteArgs
				>(GIFT_CARD_DELETE_MUTATION, {
					id,
				});

				loading = false; //

				if (checkIfGraphqlResultHasError(result, 'giftCardDelete', $CommonState.DeleteSuccess))
					return;

				tableRef?.triggerFetchData(); // trigger refetching table data
			},
		});
	};

	const handleDeleteSelectedGiftcards = () => {
		const ids = Object.keys(selectedGiftcards);
		if (!ids.length) return;

		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;

				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'giftCardBulkDelete'>,
					MutationGiftCardBulkDeleteArgs
				>(GIFT_CARD_BULK_DELETE_MUTATION, { ids });

				if (checkIfGraphqlResultHasError(result, 'giftCardBulkDelete', $CommonState.DeleteSuccess))
					return;

				loading = false;
				selectedGiftcards = {};
				tableRef?.triggerFetchData();
			},
		});
	};

	const handleToggleGiftcardStatus = async (id: string, active: boolean) => {
		loading = true;
		const hasErr = await giftcardUtil.handleToggleGiftcardStatus(id, active);
		loading = false;
		if (!hasErr) tableRef?.triggerFetchData();
	};

	const handleBulkDeactivateGiftcards = async () => {
		const ids = Object.keys(selectedGiftcards);
		if (!ids.length) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Mutation['giftCardBulkDeactivate'],
			MutationGiftCardBulkDeactivateArgs
		>(GIFT_CARD_BULK_DEACTIVATE_MUTATION, {
			ids,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardBulkDeactivate', $CommonState.EditSuccess))
			return;

		selectedGiftcards = {};
		tableRef?.triggerFetchData();
	};

	const handleBulkActivateGiftcards = async () => {
		const ids = Object.keys(selectedGiftcards);
		if (!ids.length) return;

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Mutation['giftCardBulkActivate'],
			MutationGiftCardBulkActivateArgs
		>(GIFT_CARD_BULK_ACTIVATE_MUTATION, {
			ids,
		});
		loading = false;

		if (checkIfGraphqlResultHasError(result, 'giftCardBulkActivate', $CommonState.EditSuccess))
			return;

		selectedGiftcards = {};
		tableRef?.triggerFetchData();
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
		disabled={loading}
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
		disabled={loading}
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
		{#snippet trigger({ onclick })}
			<IconButton icon={Dots} {onclick} size="xs" color="gray" variant="light" disabled={loading} />
		{/snippet}
		<MenuItem
			startIcon={Trash}
			onclick={() => handleDeleteGiftcard(item.id)}
			class="text-red-600"
			disabled={loading}
		>
			{$tranFunc('giftcard.delete')}
		</MenuItem>
		<MenuItem
			disabled={loading}
			startIcon={item.isActive ? Cancel : CircleCheck}
			onclick={() => handleToggleGiftcardStatus(item.id, !item.isActive)}
			class={item.isActive ? 'text-gray-600' : 'text-green-600'}
		>
			{item.isActive ? $tranFunc('giftcard.deactivate') : $tranFunc('giftcard.activate')}
		</MenuItem>
	</DropDown>
{/snippet}

{#snippet issueAt({ item }: { item: GiftCard })}
	<span>{dayjs(item.created).format(SitenameTimeFormat)}</span>
{/snippet}

{#snippet status({ item }: { item: GiftCard })}
	<Badge
		text={item.isActive ? $tranFunc('staff.active') : $tranFunc('giftcard.status.deactivated')}
		size="sm"
		variant="filled"
		color={item.isActive ? 'green' : 'red'}
	/>
{/snippet}

<div class="flex items-center justify-between mb-2">
	<Filter bind:variables={giftcardFilterVariables} {tableRef} />
	<div class="flex gap-1.5">
		{#if Object.keys(selectedGiftcards).length}
			<Button
				disabled={loading}
				onclick={handleBulkActivateGiftcards}
				endIcon={CircleCheck}
				color="green"
				size="sm"
			>
				{$tranFunc('giftcard.activate')}
			</Button>
			<Button
				size="sm"
				disabled={loading}
				onclick={handleBulkDeactivateGiftcards}
				endIcon={Ban}
				color="indigo"
			>
				{$tranFunc('giftcard.deactivate')}
			</Button>
			<IconButton
				icon={Trash}
				variant="light"
				color="red"
				size="sm"
				onclick={handleDeleteSelectedGiftcards}
				disabled={loading}
			/>
		{/if}
		<Settings bind:variables={giftcardFilterVariables} bind:selectedIds={selectedGiftcards} />
	</div>
</div>

<GraphqlPaginableTable
	query={GIFTCARD_LIST_QUERY}
	resultKey="giftCards"
	bind:variables={giftcardFilterVariables}
	columns={COLUMNS}
	disabled={loading}
	bind:this={tableRef}
/>
