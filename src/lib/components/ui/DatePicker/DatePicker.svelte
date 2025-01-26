<script lang="ts">
	import type { FocusEventHandler } from 'svelte/elements';
	import { cloneDate, getCalendarDays, getMonthLength, type CalendarDay } from './date-utils';
	import { getInnerLocale } from './locale';
	import type { Locale } from './types';
	import { IconButton } from '../Button';
	import { ChevronLeft, ChevronRight } from '$lib/components/icons';
	import { Select, type SelectOption } from '../select';
	import type { Snippet } from 'svelte';
	import TimePicker from './TimePicker.svelte';

	type Props = {
		value?: Date;
		timePrecision?: 'minute' | 'second' | 'millisecond';
		min?: Date;
		max?: Date;
		locale?: Locale;
		onSelect: (v: Date) => void;
		browseWithoutSelecting?: boolean;
		onfocusout?: FocusEventHandler<HTMLDivElement>;
		children?: Snippet;
	};

	/** Default Date to use */
	const defaultDate = new Date();
	const todayDate = defaultDate;

	let {
		value = $bindable(),
		timePrecision,
		min = new Date(defaultDate.getFullYear() - 10, 0, 1),
		max = new Date(defaultDate.getFullYear(), 11, 31, 23, 59, 59, 999),
		locale = {},
		browseWithoutSelecting = false,
		onfocusout,
		onSelect,
		children
	}: Props = $props();

	function getYearSelectOptions(min: Date, max: Date): SelectOption[] {
		let years: SelectOption[] = [];
		const minFullYear = min.getFullYear();
		const maxFullYear = max.getFullYear();
		for (let i = minFullYear; i <= maxFullYear; i++) {
			years.push({
				value: i,
				label: `${i}`
			});
		}
		return years;
	}

	let browseDate = $state(value ? cloneDate(value) : cloneDate(clampDate(defaultDate, min, max)));
	let yearSelectOptions = $derived(getYearSelectOptions(min, max));
	let browseYear = $derived(browseDate.getFullYear());
	let iLocale = $derived(getInnerLocale(locale));
	let browseMonth = $derived(browseDate.getMonth());
	let calendarDays = $derived(getCalendarDays(browseDate, iLocale.weekStartsOn));
	let dropdownMonthOptions = $derived<SelectOption[]>(
		iLocale.months.map((m, idx) => ({
			disabled:
				new Date(browseYear, idx, getMonthLength(browseYear, idx), 23, 59, 59, 999) < min ||
				new Date(browseYear, idx) > max,
			value: idx,
			label: m
		}))
	);

	$effect(() => {
		if (value && value > max) {
			setValue(max);
		} else if (value && value < min) {
			setValue(min);
		}
	});

	$effect(() => {
		if (value) setBrowseDate(value);
	});

	function setMonth(newMonth: number) {
		let newYear = browseDate.getFullYear();
		if (newMonth === 12) {
			newMonth = 0;
			newYear++;
		} else if (newMonth === -1) {
			newMonth = 11;
			newYear--;
		}

		const maxDate = getMonthLength(newYear, newMonth);
		const newDate = Math.min(browseDate.getDate(), maxDate);
		browse(
			new Date(
				newYear,
				newMonth,
				newDate,
				browseDate.getHours(),
				browseDate.getMinutes(),
				browseDate.getSeconds(),
				browseDate.getMilliseconds()
			)
		);
	}

	function setBrowseDate(value?: Date) {
		if (browseDate.getTime() !== value?.getTime()) {
			browseDate = value ? cloneDate(value) : browseDate;
		}
	}

	function setValue(d: Date) {
		if (d.getTime() !== value?.getTime()) {
			browseDate = clamp(d, min, max);
			value = cloneDate(browseDate);
		}
	}

	function setValueDate(d: Date) {
		if (d.getTime() !== value?.getTime()) {
			browseDate = clampDate(d, min, max);
			value = cloneDate(browseDate);
		}
	}

	/** Set the browseDate */
	function browse(d: Date) {
		browseDate = clampDate(d, min, max);
		if (!browseWithoutSelecting && value) {
			setValue(browseDate);
		}
	}

	function clamp(d: Date, min: Date, max: Date) {
		if (d > max) {
			return cloneDate(max);
		} else if (d < min) {
			return cloneDate(min);
		} else {
			return cloneDate(d);
		}
	}

	function clampDate(d: Date, min: Date, max: Date) {
		const limit = clamp(d, min, max);
		if (limit.getTime() !== d.getTime()) {
			d = new Date(
				limit.getFullYear(),
				limit.getMonth(),
				limit.getDate(),
				d.getHours(),
				d.getMinutes(),
				d.getSeconds(),
				d.getMilliseconds()
			);
			d = clamp(d, min, max);
		}
		return d;
	}

	function setYear(newYear: number) {
		browseDate.setFullYear(newYear);
		browse(browseDate);
	}

	function selectDay(calendarDay: CalendarDay) {
		if (dayIsInRange(calendarDay, min, max)) {
			browseDate.setFullYear(0);
			browseDate.setMonth(0);
			browseDate.setDate(1);
			browseDate.setFullYear(calendarDay.year);
			browseDate.setMonth(calendarDay.month);
			browseDate.setDate(calendarDay.number);
			setValueDate(browseDate);
			onSelect(cloneDate(browseDate));
		}
	}

	function dayIsInRange(calendarDay: CalendarDay, min: Date, max: Date) {
		const date = new Date(calendarDay.year, calendarDay.month, calendarDay.number);
		const minDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());
		const maxDate = new Date(max.getFullYear(), max.getMonth(), max.getDate());
		return date >= minDate && date <= maxDate;
	}

	function shiftKeydown(e: KeyboardEvent) {
		if (e.shiftKey && e.key === 'ArrowUp') {
			setYear(browseDate.getFullYear() - 1);
		} else if (e.shiftKey && e.key === 'ArrowDown') {
			setYear(browseDate.getFullYear() + 1);
		} else if (e.shiftKey && e.key === 'ArrowLeft') {
			setMonth(browseDate.getMonth() - 1);
		} else if (e.shiftKey && e.key === 'ArrowRight') {
			setMonth(browseDate.getMonth() + 1);
		} else {
			return false;
		}
		e.preventDefault();
		return true;
	}

	function setTime(d: Date) {
		browseDate = clamp(d, min, max);
		if (value) {
			setValue(browseDate);
		}
		return browseDate;
	}

	function yearKeydown(e: KeyboardEvent) {
		let shift = e.shiftKey || e.altKey;
		if (shift) {
			shiftKeydown(e);
			return;
		} else if (e.key === 'ArrowUp') {
			setYear(browseDate.getFullYear() - 1);
		} else if (e.key === 'ArrowDown') {
			setYear(browseDate.getFullYear() + 1);
		} else if (e.key === 'ArrowLeft') {
			setMonth(browseDate.getMonth() - 1);
		} else if (e.key === 'ArrowRight') {
			setMonth(browseDate.getMonth() + 1);
		} else {
			shiftKeydown(e);
			return;
		}
		e.preventDefault();
	}

	function monthKeydown(e: KeyboardEvent) {
		let shift = e.shiftKey || e.altKey;
		if (shift) {
			shiftKeydown(e);
			return;
		} else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			setMonth(browseDate.getMonth() - 1);
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			setMonth(browseDate.getMonth() + 1);
		} else {
			shiftKeydown(e);
			return;
		}
		e.preventDefault();
	}

	function keydown(e: KeyboardEvent) {
		let shift = e.shiftKey || e.altKey;
		if (
			(e.target as HTMLElement)?.tagName === 'SELECT' ||
			(e.target as HTMLElement)?.tagName === 'SPAN'
		) {
			// Ignore date/month <select> & TimePicker <input>
			return;
		}
		if (shift) {
			shiftKeydown(e);
			return;
		} else if (e.key === 'ArrowUp') {
			browseDate.setDate(browseDate.getDate() - 7);
			setValueDate(browseDate);
		} else if (e.key === 'ArrowDown') {
			browseDate.setDate(browseDate.getDate() + 7);
			setValueDate(browseDate);
		} else if (e.key === 'ArrowLeft') {
			browseDate.setDate(browseDate.getDate() - 1);
			setValueDate(browseDate);
		} else if (e.key === 'ArrowRight') {
			browseDate.setDate(browseDate.getDate() + 1);
			setValueDate(browseDate);
		} else if (e.key === 'Enter') {
			setValue(browseDate);
			onSelect(cloneDate(browseDate));
		} else {
			return;
		}
		e.preventDefault();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	tabindex="0"
	onkeydown={keydown}
	{onfocusout}
	class="inline-block text-gray-700 bg-white select-none p-2 cursor-default text-sm border border-gray-200 rounded-lg outline-none"
>
	<div class="outline-none" tabindex="-1">
		<!-- navigation -->
		<div class="flex justify-center items-center pb-2">
			<!-- prev month -->
			<IconButton
				aria-label="Previous month"
				icon={ChevronLeft}
				onclick={() => setMonth(browseDate.getMonth() - 1)}
				size="xs"
				variant="light"
				color="gray"
			/>
			<!-- dropdown month -->
			<div class="date-dropdown mx-1 relative flex grow">
				<Select
					options={dropdownMonthOptions}
					placeholder="Month"
					value={browseMonth}
					oninput={(e) => setMonth(parseInt(e.currentTarget.value))}
					onkeydown={monthKeydown}
					size="xs"
					class="w-26"
				/>
			</div>
			<!-- dropdown year -->
			<div class="date-dropdown mx-1 relative flex grow">
				<Select
					options={yearSelectOptions}
					value={browseYear}
					oninput={(e) => setYear(parseInt(e.currentTarget.value))}
					onkeydown={yearKeydown}
					placeholder="Year"
					size="xs"
					class="w-18"
				/>
			</div>
			<!-- next month -->
			<IconButton
				aria-label="Next month"
				icon={ChevronRight}
				onclick={() => setMonth(browseDate.getMonth() + 1)}
				size="xs"
				variant="light"
				color="gray"
			/>
		</div>

		<!-- header -->
		<div class="flex font-semibold text-xs pb-0.5">
			{#each Array(7) as _, idx (idx)}
				<div class="w-8 text-center grow">
					{iLocale.weekdays[iLocale.weekStartsOn + idx - (idx + iLocale.weekStartsOn < 7 ? 0 : 7)]}
				</div>
			{/each}
		</div>

		{#each Array(6) as _, idx}
			<div class="flex flex-wrap">
				{#each calendarDays.slice(idx * 7, idx * 7 + 7) as calendarDay}
					{@const cellSelected =
						value &&
						calendarDay.year === value.getFullYear() &&
						calendarDay.month === value.getMonth() &&
						calendarDay.number === value.getDate()}
					{@const isToday =
						calendarDay.year === todayDate.getFullYear() &&
						calendarDay.month === todayDate.getMonth() &&
						calendarDay.number === todayDate.getDate()}
					<div class="p-px w-1/7 flex items-center justify-center">
						<div
							class="cell"
							tabindex="0"
							class:other-month={calendarDay.month !== browseMonth}
							class:selected-cell={cellSelected}
							class:today-cell={isToday}
							onclick={() => selectDay(calendarDay)}
							onkeyup={(e) => e.key === 'Enter' && selectDay(calendarDay)}
						>
							{calendarDay.number}
						</div>
					</div>
				{/each}
			</div>
		{/each}

		<TimePicker {timePrecision} bind:browseDate {setTime} />

		{@render children?.()}
	</div>
</div>

<style>
	@import 'tailwindcss/theme';

	.other-month {
		@apply text-gray-300!;
	}

	.cell {
		@apply w-6 h-6 text-xs cursor-pointer rounded-lg focus:bg-blue-100 flex items-center justify-center text-blue-500;
	}

	.selected-cell {
		@apply font-semibold bg-blue-50! ring-2 ring-blue-300;
	}

	.today-cell {
		@apply text-red-500;
	}
</style>
