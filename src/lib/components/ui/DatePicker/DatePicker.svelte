<script lang="ts">
	import { cloneDate, getCalendarDays, getMonthLength, type CalendarDay } from './date-utils';
	import { getInnerLocale } from './locale';
	import type { Locale } from './types';

	type Props = {
		value?: Date;
		timePrecision?: 'minute' | 'second' | 'millisecond';
		min?: Date;
		max?: Date;
		locale?: Locale;
		onSelect: (v: Date) => void;
		browseWithoutSelecting?: boolean;
	};

	/** Default Date to use */
	const defaultDate = new Date();
	const todayDate = defaultDate;

	let {
		value,
		timePrecision,
		min = new Date(defaultDate.getFullYear() - 20, 0, 1),
		max = new Date(defaultDate.getFullYear(), 11, 31, 23, 59, 59, 999),
		locale = {},
		browseWithoutSelecting = false,
		onSelect
	}: Props = $props();

	function getYears(min: Date, max: Date) {
		let years = [];
		for (let i = min.getFullYear(); i <= max.getFullYear(); i++) {
			years.push(i);
		}
		return years;
	}

	let browseDate = $state(value ? cloneDate(value) : cloneDate(clampDate(defaultDate, min, max)));
	let years = $state.raw(getYears(min, max));
	let browseYear = $derived(browseDate.getFullYear());
	let iLocale = $derived(getInnerLocale(locale));
	let browseMonth = $derived(browseDate.getMonth());
	let calendarDays = $derived(getCalendarDays(browseDate, iLocale.weekStartsOn));

	$effect(() => {
		if (value && value > max) {
			setValue(max);
		} else if (value && value < min) {
			setValue(min);
		}
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

	$effect(() => {
		setBrowseDate(value);
	});

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
	class="inline-block text-gray-700 bg-white select-none p-2 cursor-default text-sm border border-gray-300 rounded-sm shadow-md outline-none outline-0 transition-all delay-80 ease-in-out focus:border-gray-300 focus:shadow-md"
>
	<div class="outline-none" tabindex="-1">
		<div class="flex justify-center items-center pb-2">
			<button
				type="button"
				aria-label="Previous month"
				class="page-button"
				tabindex="-1"
				onclick={() => setMonth(browseDate.getMonth() - 1)}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
					><path
						d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"
						transform="rotate(180, 12, 12)"
					/></svg
				>
			</button>
		</div>
	</div>
</div>

<style>
  @import 'tailwindcss/theme';

  .page-btn {
    @apply bg-transparent w-8 h-8 flex shrink rounded-sm border border-transparent items-center justify-center hover:bg-gray-200 hover:border-gray-200;
  }

  .page-btn svg {
    @apply w-3 h-3;
  }
</style>
