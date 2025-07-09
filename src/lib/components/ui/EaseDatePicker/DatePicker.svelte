<script lang="ts">
	import * as easePick from '@easepick/core';
	import { onDestroy, onMount } from 'svelte';
	import { Input, type InputProps } from '$lib/components/ui/Input';
	import {
		EASEPICK_AMP_STYLE_v1_2_1,
		EASEPICK_CORE_STYLE_v1_2_1,
		EASEPICK_LOCK_STYLE_v1_2_1,
		EASEPICK_RANGE_STYLE_v1_2_1,
		EASEPICK_TIME_STYLE_v1_2_1,
	} from '$lib/utils/consts';
	import type { IPickerConfig } from '@easepick/core/dist/types';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import dayjs from 'dayjs';

	const NOW = new Date();
	const BASIC_TIME_CONFIG = 'YYYY-MM-DD';

	type TimeValue = Partial<Record<'date' | 'start' | 'end', string | Date>>;

	type Props = {
		theme?: 'light' | 'dark';
		/** default `YYYY-MM-DD` */
		format?: string;

		/** for quick month, year navigation */
		allowSelectMonthYears?: {
			showMonths?: boolean;
			showYears?: {
				min?: number;
				/** default to current year */
				max?: number;
			};
			showResetBtn?: boolean;
		};

		/** for range selection */
		allowSelectRange?: boolean;

		/** for lock constraint */
		timeLock?: {
			minDate?: Date;
			maxDate?: Date;
			minDays?: number;
			maxDays?: number;
		};

		value?: TimeValue;

		/** for time selection and day time format */
		timeConfig?:
			| {
					/** default `1` */
					stepHours?: number;
					/** default `5` */
					stepMinutes?: number;
					stepSeconds?: number;
					format?: 12 | 24;
			  }
			| false;

		autoApply?: boolean;
		onchange?: (value: TimeValue) => void;
		class?: string;
	} & Omit<InputProps, 'value' | 'onchange'>;

	let {
		theme = 'light',
		allowSelectMonthYears,
		allowSelectRange,
		timeLock,
		timeConfig = {
			stepHours: 1,
			stepMinutes: 5,
			format: 24,
		},
		autoApply = timeConfig ? false : true,
		value: REAL_VALUE = $bindable({}),
		format = BASIC_TIME_CONFIG,
		onchange,
		class: className = '',
		...rest
	}: Props = $props();

	let datePicker = $state<easePick.Core>();
	let inputRef = $state<HTMLInputElement>();
	let inputEndRef = $state<HTMLInputElement>();

	let ACTUAL_TIME_FORMAT = $derived.by(() => {
		if (!timeConfig) {
			return format ? format : BASIC_TIME_CONFIG;
		}

		if (!timeConfig.format || timeConfig.format === 24) {
			return `${BASIC_TIME_CONFIG} HH:mm`;
		}

		return `${BASIC_TIME_CONFIG} hh:mm`;
	});

	let inputReprValue = $state<TimeValue>({});

	$effect(() => {
		if (!REAL_VALUE) {
			inputReprValue = {};
			return;
		}

		const { start, end, date } = REAL_VALUE;
		if (date) {
			inputReprValue = {
				date: dayjs(date).format(ACTUAL_TIME_FORMAT),
			};
			return;
		}

		if (start && end) {
			const startStr = dayjs(start).format(ACTUAL_TIME_FORMAT);
			const endStr = dayjs(end).format(ACTUAL_TIME_FORMAT);

			inputReprValue = {
				start: startStr,
				end: endStr,
			};
		}
	});

	onMount(async () => {
		const pickerConfig: IPickerConfig = {
			zIndex: 100000000,
			element: inputRef as HTMLElement,
			css: [EASEPICK_CORE_STYLE_v1_2_1],
			plugins: [],
			autoApply,
			format,
		};

		if (allowSelectMonthYears !== undefined || theme === 'dark') {
			const ampPlugin = await import('@easepick/amp-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_AMP_STYLE_v1_2_1);
			pickerConfig.plugins!.push(ampPlugin.AmpPlugin);

			pickerConfig['AmpPlugin'] = {
				dropdown: {
					months: allowSelectMonthYears?.showMonths,
					years: !!allowSelectMonthYears?.showYears,
					minYear: allowSelectMonthYears?.showYears?.min || 2020,
					maxYear: allowSelectMonthYears?.showYears?.max || NOW.getFullYear(),
				},
				resetButton: allowSelectMonthYears?.showResetBtn,
				darkMode: theme === 'dark',
			};
		}

		if (timeLock !== undefined) {
			const lockPlugin = await import('@easepick/lock-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_LOCK_STYLE_v1_2_1);
			pickerConfig.plugins!.push(lockPlugin.LockPlugin);

			pickerConfig['LockPlugin'] = timeLock;
		}

		if (allowSelectRange) {
			const rangePlugin = await import('@easepick/range-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_RANGE_STYLE_v1_2_1);
			pickerConfig.plugins!.push(rangePlugin.RangePlugin);
			pickerConfig['RangePlugin'] = {
				elementEnd: inputEndRef,
			};
		}

		if (timeConfig) {
			const timePlugin = await import('@easepick/time-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_TIME_STYLE_v1_2_1);
			pickerConfig.plugins!.push(timePlugin.TimePlugin);

			pickerConfig['TimePlugin'] = {
				stepHours: timeConfig.stepHours,
				stepMinutes: timeConfig.stepMinutes,
				seconds: !!timeConfig.stepSeconds,
				stepSeconds: timeConfig.stepSeconds,
				format12: timeConfig.format === 12,
			};
		}

		if (!pickerConfig.element && inputRef) {
			pickerConfig.element = inputRef as HTMLElement;
		}

		datePicker = new easePick.create(pickerConfig);

		datePicker.on('select', (evt) => {
			REAL_VALUE = evt.detail;
			onchange?.(evt.detail);
		});
	});

	onDestroy(() => datePicker?.destroy());
</script>

{#if !datePicker}
	<SkeletonContainer class="w-full">
		<Skeleton class="h-6 w-full" />
	</SkeletonContainer>
{/if}

{#if allowSelectRange}
	<div class="flex items-start gap-1 {!datePicker ? 'hidden! opacity-0!' : ''} {className}">
		<Input
			{...rest}
			bind:ref={inputRef}
			bind:value={inputReprValue.start}
			readonly
			placeholder={rest.placeholder || ACTUAL_TIME_FORMAT}
		/>
		<Input
			{...rest}
			bind:ref={inputEndRef}
			bind:value={inputReprValue.end}
			readonly
			placeholder={rest.placeholder || ACTUAL_TIME_FORMAT}
		/>
	</div>
{:else}
	<Input
		{...rest}
		bind:ref={inputRef}
		bind:value={inputReprValue.date}
		class={`${!datePicker ? 'hidden! opacity-0!' : ''} ${className}`}
		readonly
		placeholder={rest.placeholder || ACTUAL_TIME_FORMAT}
	/>
{/if}
