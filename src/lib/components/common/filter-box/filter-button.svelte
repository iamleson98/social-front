<script lang="ts" generics="T">
	import FilterBox from './filter-box.svelte';
	import type {
		FilterConditions,
		FilterItemValue,
		FilterOperator,
		FilterProps,
		FilterResult,
	} from './types';
	import { FilterCog } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Popover } from '$lib/components/ui/Popover';
	import { afterNavigate, goto } from '$app/navigation';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { page } from '$app/state';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';

	type Props = {
		filterOptions: FilterProps<T>[];
		onApply?: (filters: FilterResult<T>) => void;
	};

	let { filterOptions, onApply }: Props = $props();

	const FILTER_RANGE_REGEX = /^\[([\w\d\.-]+)\,([\w\d\.-]+)\]$/;
	const FILTER_KEYS_MAP = filterOptions.reduce(
		(acc, { key }) => {
			acc[key] = true;
			return acc;
		},
		{} as Record<keyof T, boolean>,
	);

	let isFilterOpening = $state(false);
	/**
	 * filter state for the filter button
	 */
	let filters = $state<FilterConditions<T>>({} as FilterConditions<T>);
	let filtersCount = $derived(Object.keys(filters).length);

	const handleApply = async (flts: FilterConditions<T>) => {
		if (!Object.keys(flts)) return;

		const params = new URLSearchParams();

		for (const key of Object.keys(flts)) {
			const filterOpt = flts[key as keyof T];
			if (!filterOpt) continue;

			if (filterOpt.operator === 'lte') {
				params.append(key as string, `[null,${filterOpt.value}]`);
			} else if (filterOpt.operator === 'gte') {
				params.append(key as string, `[${filterOpt.value},null]`);
			} else if (filterOpt.operator === 'oneOf') {
				params.append(key as string, `[${filterOpt.value}]`);
			} else if (filterOpt.operator === 'range' && Array.isArray(filterOpt.value)) {
				params.append(key as string, `[${filterOpt.value[0]},${filterOpt.value[1]}]`);
			} else if (filterOpt.operator === 'eq') {
				params.append(key as string, filterOpt.value as string);
			}
		}

		isFilterOpening = false;

		await goto(`?${params.toString()}`);
	};

	afterNavigate(async () => {
		scrollTo({ top: 0, behavior: 'smooth' });

		const queryParams = parseUrlSearchParams(page.url);
		const filtersResult = {} as FilterResult<T>;
		const newFilters = {} as FilterConditions<T>;

		for (const key in queryParams) {
			if (!FILTER_KEYS_MAP[key as keyof T]) continue;

			let value = queryParams[key];

			if (typeof value === 'number' || !FILTER_RANGE_REGEX.test(value)) {
				if (typeof value === 'string' && numberRegex.test(value)) {
					value = Number(value);
				}

				const conditions: Partial<Record<FilterOperator, FilterItemValue>> = {
					lte: value,
					gte: value,
				};

				filtersResult[key as keyof T] = conditions;
				newFilters[key as keyof T] = {
					operator: 'eq',
					value,
				};
				continue;
			}

			// wait for regex to match
			const matches = FILTER_RANGE_REGEX.exec(value);
			if (!matches) continue;

			const gte = matches[1].trim();
			const lte = matches[2].trim();

			if (gte || lte) {
				if (gte !== 'null' && lte !== 'null') {
					filtersResult[key as keyof T] = {
						gte,
						lte,
					};
					newFilters[key as keyof T] = {
						operator: 'range',
						value: [gte, lte],
					};
				} else if (gte !== 'null') {
					filtersResult[key as keyof T] = {
						gte,
					};
					newFilters[key as keyof T] = {
						operator: 'gte',
						value: gte,
					};
				} else if (lte !== 'null') {
					filtersResult[key as keyof T] = {
						lte,
					};
					newFilters[key as keyof T] = {
						operator: 'lte',
						value: lte,
					};
				}
			}
		}

		filters = newFilters;
		onApply?.(filtersResult);
	});
</script>

{#snippet trigger(opts: DropdownTriggerInterface)}
	<Button variant="outline" size="sm" {...opts} class="indicator" endIcon={FilterCog}>
		{#if filtersCount}
			<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filtersCount}</span>
		{/if}
		Filters
	</Button>
{/snippet}

<Popover {trigger} placement="bottom-start" bind:open={isFilterOpening}>
	<FilterBox
		header="Filters"
		options={filterOptions}
		onApply={handleApply}
		{filters}
		class="min-w-96"
		onClose={() => (isFilterOpening = false)}
	/>
</Popover>
