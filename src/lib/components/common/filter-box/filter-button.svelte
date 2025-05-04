<script lang="ts" generics="T">
	import FilterBox from './filter-box.svelte';
	import type {
		FilterConditions,
		FilterItemValue,
		FilterOperator,
		FilterProps,
		FilterResult
	} from './types';
	import { FilterCog } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { SocialSize } from '$lib/components/ui/common';
	import { Popover } from '$lib/components/ui/Popover';
	import { afterNavigate, goto } from '$app/navigation';
	import { numberRegex, parseUrlSearchParams } from '$lib/utils/utils';
	import { page } from '$app/state';
	import { SvelteMap } from 'svelte/reactivity';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';

	type Props = {
		filterOptions: FilterProps<T>[];
		size?: SocialSize;
		onApply?: (filters: FilterResult<T>) => void;
	};

	let { filterOptions, size = 'sm', onApply }: Props = $props();

	const FILTER_RANGE_REGEX = /^\[([\w\d\.-]+)\,([\w\d\.-]+)\]$/;
	const FILTER_KEYS_MAP = filterOptions.reduce(
		(acc, { key }) => {
			acc[key] = true;
			return acc;
		},
		{} as Record<keyof T, boolean>
	);

	let isFilterOpening = $state(false);

	let filters = $state<FilterConditions<T>>(new SvelteMap());

	const handleApply = async (flts: FilterConditions<T>) => {
		const params = new URLSearchParams();

		for (const key of flts.keys()) {
			const filterOpt = flts.get(key);
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
		const filtersResult: FilterResult<T> = {};
		const newFilters: FilterConditions<T> = new SvelteMap();

		for (const key in queryParams) {
			if (!FILTER_KEYS_MAP[key as keyof T]) continue;

			let value = queryParams[key];

			if (typeof value === 'number' || !FILTER_RANGE_REGEX.test(value)) {
				if (typeof value === 'string' && numberRegex.test(value)) {
					value = Number(value);
				}

				const conditions: Partial<Record<FilterOperator, FilterItemValue>> = {
					lte: value,
					gte: value
				};

				filtersResult[key as keyof T] = conditions;
				newFilters.set(key as keyof T, {
					operator: 'eq',
					value
				});
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
						lte
					};
					newFilters.set(key as keyof T, {
						operator: 'range',
						value: [gte, lte]
					});
				} else if (gte !== 'null') {
					filtersResult[key as keyof T] = {
						gte
					};
					newFilters.set(key as keyof T, {
						operator: 'gte',
						value: gte
					});
				} else if (lte !== 'null') {
					filtersResult[key as keyof T] = {
						lte
					};
					newFilters.set(key as keyof T, {
						operator: 'lte',
						value: lte
					});
				}
			}
		}

		filters = newFilters;
		onApply?.(filtersResult);
	});
</script>

{#snippet trigger(opts: DropdownTriggerInterface)}
	<Button variant="light" {size} {...opts} class="indicator" endIcon={FilterCog}>
		{#if filters.size}
			<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filters.size}</span>
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
