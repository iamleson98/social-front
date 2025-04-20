<script lang="ts" generics="T extends Record<string, unknown>">
	import { tranFunc } from '$i18n';
	import { ChevronLeft, ChevronRight, Icon } from '$lib/components/icons';
	import { IconButton } from '../Button';
	import Button from '../Button/Button.svelte';
	import { DropDown, type DropdownTriggerInterface, type MenuItemProps } from '../Dropdown';
	import { SortIconsMap, type SortState, type TableProps } from './types';

	const ROW_OPTIONS = [10, 20, 30, 50, 100];

	let {
		items,
		columns,
		tableClass = '',
		pagination,
		onNextPagelick,
		onPreviousPagelick,
		onChangeRowsPerPage,
		onSortChange,
		scale = 'md',
		rowsPerPage,
		sortMultiple = false,
		defaultSortState = {}
	}: TableProps<T> = $props();

	let tdClass = scale === 'sm' ? 'p-1!' : '';

	const DEFAULT_SORT_STATE = columns.reduce<SortState>((acc, column) => {
		if (column.sortable) return { ...acc, [column.key || column.title]: 'neutral' };
		return acc;
	}, {});
	let innerRowsPerPage = $state<number>(rowsPerPage || ROW_OPTIONS[0]);
	let sortState = $state.raw<SortState>({ ...DEFAULT_SORT_STATE, ...defaultSortState });

	const handleNavigateClick = (dir: 1 | -1) => {
		if (!pagination) return;
		if (dir === -1 && pagination.startCursor) onPreviousPagelick?.(pagination.startCursor);
		else if (dir === 1 && pagination.endCursor) onNextPagelick?.(pagination.endCursor);
	};

	const handleSortClick = (column: string) => {
		const colSortState: SortState = {};
		if (sortState[column] === 'neutral') {
			colSortState[column] = 'asc';
		} else if (sortState[column] === 'asc') {
			colSortState[column] = 'desc';
		} else {
			colSortState[column] = 'neutral';
		}
		if (sortMultiple) {
			sortState = { ...sortState, ...colSortState };
			onSortChange?.(sortState);
		} else {
			sortState = { ...DEFAULT_SORT_STATE, ...colSortState };
			onSortChange?.(colSortState);
		}
	};

	const handleRowsPerPageChange = (num: number) => {
		if (num !== innerRowsPerPage) {
			innerRowsPerPage = num;
			onChangeRowsPerPage?.(num);
		}
	};

	let PAGIN_OPTIONS = $derived(
		ROW_OPTIONS.map<MenuItemProps>((num) => ({
			children: `${num}`,
			onclick: () => handleRowsPerPageChange(num)
		}))
	);
</script>

<table class="table {tableClass}">
	<thead>
		<tr>
			{#each columns as column, idx (idx)}
				{@const classes = column?.sortable
					? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-200'
					: ''}
				{@const props = column?.sortable
					? {
							onclick: () => handleSortClick(column.key || column.title),
							onkeyup: (evt: KeyboardEvent) =>
								evt.key === 'Enter' && handleSortClick(column.key || column.title)
						}
					: {}}
				<th class="p-[unset]!">
					<svelte:element
						this={column?.sortable ? 'button' : 'div'}
						class="flex items-center gap-2 w-full h-full p-2 justify-between {classes}"
						{...props}
					>
						<div class="flex items-center gap-1">
							{#if column?.startIcon}
								<Icon icon={column.startIcon} />
							{/if}
							<span>{column.title}</span>
							{#if column?.endIcon}
								<Icon icon={column.endIcon} />
							{/if}
						</div>
						{#if column?.sortable}
							<span>
								<Icon icon={SortIconsMap[sortState[column.key || column.title]]} />
							</span>
						{/if}
					</svelte:element>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each items as item, idx (idx)}
			<tr>
				{#each columns as column, idx (idx)}
					<td class={tdClass}>
						<div>
							{@render column.child({ item })}
						</div>
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<!-- MARK: pagination -->
{#if pagination}
	<div class="mt-4 flex items-center justify-between">
		<div>
			{#snippet trigger(opts: DropdownTriggerInterface)}
				<Button size="xs" variant="light" {...opts}>No. of row {innerRowsPerPage}</Button>
			{/snippet}
			<DropDown {trigger} placement="bottom-start" options={PAGIN_OPTIONS} />
		</div>
		<div class="flex items-center gap-2 justify-end">
			<IconButton
				icon={ChevronLeft}
				size="xs"
				disabled={!pagination.hasPreviousPage}
				aria-label="Previous page"
				class="tooltip tooltip-top"
				data-tip={$tranFunc('common.prevPage')}
				color="gray"
				variant="light"
				onclick={() => handleNavigateClick(-1)}
			/>
			<IconButton
				icon={ChevronRight}
				size="xs"
				disabled={!pagination.hasNextPage}
				aria-label="Next page"
				class="tooltip tooltip-top"
				data-tip={$tranFunc('common.nextPage')}
				color="gray"
				variant="light"
				onclick={() => handleNavigateClick(1)}
			/>
		</div>
	</div>
{/if}
