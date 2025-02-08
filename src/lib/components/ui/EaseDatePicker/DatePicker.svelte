<script lang="ts">
	import * as easePick from '@easepick/core';
	import { onDestroy, onMount } from 'svelte';
	import { Input, type InputProps } from '../Input';
	import {
		EASEPICK_AMP_STYLE_v1_2_1,
		EASEPICK_CORE_STYLE_v1_2_1,
		EASEPICK_LOCK_STYLE_v1_2_1,
		EASEPICK_RANGE_STYLE_v1_2_1,
		EASEPICK_TIME_STYLE_v1_2_1
	} from '$lib/utils/consts';
	import type { IPickerConfig } from '@easepick/core/dist/types';
	import { Skeleton, SkeletonContainer } from '../Skeleton';
	import type { FocusEventHandler } from 'svelte/elements';
	import dayjs from 'dayjs';

	const NOW = new Date();

	type Props = {
		theme?: 'light' | 'dark';
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

		value?: Partial<Record<'date' | 'start' | 'end', string | Date>>;

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
		onchange?: (value: Partial<Record<'date' | 'start' | 'end', string | Date>>) => void;
	} & Omit<InputProps, 'value' | 'onchange'>;

	let {
		theme = 'light',
		allowSelectMonthYears,
		allowSelectRange,
		timeLock,
		timeConfig = {
			stepHours: 1,
			stepMinutes: 5,
			format: 24
		},
		onfocus,
		autoApply = true,
		value: realValue = $bindable({}),
		format = 'YYYY-MM-DD',
		onchange,
		...rest
	}: Props = $props();

	let datePicker = $state<easePick.Core>();
	let inputRef = $state<HTMLInputElement>();

	const BASIC_TIME_CONFIG = 'YYYY-MM-DD';

	let timeFormat = $derived.by(() => {
		if (!timeConfig) {
			return format ? format : BASIC_TIME_CONFIG;
		}

		if (!timeConfig.format || timeConfig.format === 24) {
			return `${BASIC_TIME_CONFIG} HH:mm`;
		}

		return `${BASIC_TIME_CONFIG} hh:mm`;
	});

	let inputReprValue = $derived.by(() => {
		if (!realValue) return '';
		if (realValue['date'] !== undefined) {
			return dayjs(realValue['date']).format(timeFormat);
		}
		const start = realValue['start'];
		const end = realValue['end'];

		if (start !== undefined && end !== undefined) {
			const startStr = dayjs(start).format(timeFormat);
			const endStr = dayjs(end).format(timeFormat);

			return `${startStr} - ${endStr}`;
		}
		return undefined;
	});

	onMount(async () => {
		const pickerConfig: IPickerConfig = {
			zIndex: 100000000,
			element: inputRef!,
			css: [EASEPICK_CORE_STYLE_v1_2_1],
			plugins: [],
			autoApply,
			format
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
					maxYear: allowSelectMonthYears?.showYears?.max || NOW.getFullYear()
				},
				resetButton: allowSelectMonthYears?.showResetBtn,
				darkMode: theme === 'dark'
			};
		}

		if (timeLock !== undefined) {
			const lockPlugin = await import('@easepick/lock-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_LOCK_STYLE_v1_2_1);
			pickerConfig.plugins!.push(lockPlugin.LockPlugin);

			pickerConfig['LockPlugin'] = {
				minDate: timeLock.minDate,
				maxDate: timeLock.maxDate,
				minDays: timeLock.minDays,
				maxDays: timeLock.maxDays
			};
		}

		if (allowSelectRange) {
			const rangePlugin = await import('@easepick/range-plugin');
			(pickerConfig.css as string[]).push(EASEPICK_RANGE_STYLE_v1_2_1);
			pickerConfig.plugins!.push(rangePlugin.RangePlugin);
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
				format12: timeConfig.format === 12
			};
		}

		if (!pickerConfig.element && inputRef) {
			pickerConfig.element = inputRef;
		}

		datePicker = new easePick.create(pickerConfig);

		datePicker.on('select', (evt) => {
			realValue = evt.detail;
			onchange?.(evt.detail);
		});
	});

	onDestroy(() => datePicker?.destroy());

	const handleFocus: FocusEventHandler<HTMLInputElement> = (evt) => {
		onfocus?.(evt);

		if (!datePicker) return;

		const { value } = evt.currentTarget;

		if (value) {
			try {
				const date = dayjs(value);
				datePicker.setDate(date.toDate());
			} catch {
				datePicker.setDate(NOW);
			}
		}

		datePicker.show();
	};
</script>

{#if !datePicker}
	<SkeletonContainer class="w-full">
		<Skeleton class="h-6 w-full" />
	</SkeletonContainer>
{/if}
<Input
	{...rest}
	bind:ref={inputRef}
	onfocus={handleFocus}
	value={inputReprValue}
	class={`${!datePicker ? 'hidden! opacity-0!' : ''}`}
	readonly
  placeholder={rest.placeholder || timeFormat}
/>
