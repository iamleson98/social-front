<script lang="ts" module>
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { type Channel } from '$lib/gql/graphql';
	import { BASIC_DATE_FORMAT } from '$lib/utils/consts';
	import ChannelSelect from '../channel-select/channel-select.svelte';
	import { type FilterComponentType, type FilterItemValue } from './types';
	import dayjs from 'dayjs';

	export const CommonSnippets = {
		singleNumber,
		numberRange,
		yesNo,
		singleChannelSlug,
		singleChannelId,
		multiChannelIds,
		multiChannelSlugs,
		metadata,
		singleDate,
		singleDatetime,
		dateRange,
		datetimeRange,
	};
</script>

{#snippet singleNumber({ onValue, initialValue, placeholder }: FilterComponentType)}
	<Input
		type="number"
		{placeholder}
		value={initialValue}
		inputDebounceOption={{ onInput: (evt) => onValue((evt.target as HTMLInputElement).value) }}
		size="xs"
	/>
{/snippet}

{#snippet numberRange({ onValue, initialValue = [] }: FilterComponentType)}
	{@const bounds = initialValue as number[]}
	<div class="flex gap-1 flex-col">
		{@render singleNumber({
			onValue: (value) => {
				bounds[0] = value as number;
				onValue(bounds);
			},
			initialValue: bounds[0],
			placeholder: '>=',
		})}
		{@render singleNumber({
			onValue: (value) => {
				bounds[1] = value as number;
				onValue(bounds);
			},
			initialValue: bounds[1],
			placeholder: '<=',
		})}
	</div>
{/snippet}

{#snippet yesNo({ onValue, initialValue = false }: FilterComponentType)}
	<Checkbox size="sm" label="Yes?" checked={initialValue as boolean} onCheckChange={onValue} />
{/snippet}

{#snippet singleChannelSlug({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		valueType="slug"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as Channel)?.slug as FilterItemValue)}
	/>
{/snippet}

{#snippet multiChannelSlugs({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		multiple
		onchange={(opt) => {
			if (opt && Array.isArray(opt)) {
				onValue(opt.map((opt) => opt.slug as string));
			}
		}}
		value={initialValue as string[]}
		valueType="slug"
	/>
{/snippet}

{#snippet multiChannelIds({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		multiple
		onchange={(opt) => {
			if (opt && Array.isArray(opt)) {
				onValue(opt.map((opt) => opt.id as string));
			}
		}}
		value={initialValue as string[]}
		valueType="id"
	/>
{/snippet}

{#snippet singleChannelId({ onValue, initialValue = '' }: FilterComponentType)}
	<ChannelSelect
		size="xs"
		valueType="id"
		value={initialValue as string}
		onchange={(opt) => onValue((opt as Channel)?.id as FilterItemValue)}
	/>
{/snippet}

{#snippet singleDatetime({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Time"
		value={{ date: initialValue as string }}
		onchange={(val) => onValue(dayjs(val.date).format(RFC3339TimeFormat))}
		timeConfig={{
			stepMinutes: 1,
			format: 24,
			stepHours: 1,
		}}
		allowSelectMonthYears={{
			showMonths: true,
			showResetBtn: true,
			showYears: {
				min: 2020,
				max: 2050,
			},
		}}
	/>
{/snippet}

{#snippet datetimeRange({ onValue, initialValue = ['', ''] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder="Time range"
		value={{ start: range[0], end: range[1] }}
		onchange={(value) => {
			range[0] = dayjs(value.start).format(RFC3339TimeFormat);
			range[1] = dayjs(value.end).format(RFC3339TimeFormat);
			onValue(range);
		}}
		timeConfig={{
			stepMinutes: 1,
			format: 24,
			stepHours: 1,
		}}
		allowSelectRange
		allowSelectMonthYears={{
			showMonths: true,
			showResetBtn: true,
			showYears: {
				min: 2020,
				max: 2050,
			},
		}}
	/>
{/snippet}

{#snippet singleDate({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Date"
		value={{ date: initialValue as string }}
		onchange={(vl) => onValue(dayjs(vl.date).format(BASIC_DATE_FORMAT))}
	/>
{/snippet}

{#snippet dateRange({ onValue, initialValue = ['', ''] }: FilterComponentType)}
	{@const range = initialValue as string[]}
	<EaseDatePicker
		size="xs"
		placeholder="Date range"
		value={{ start: range[0], end: range[1] }}
		onchange={(vl) => {
			range[0] = dayjs(vl.start).format(BASIC_DATE_FORMAT);
			range[1] = dayjs(vl.end).format(BASIC_DATE_FORMAT);
			onValue(range);
		}}
		allowSelectRange
	/>
{/snippet}

{#snippet metadata({ onValue, initialValue = [] }: FilterComponentType)}
	{@const keyValue = [(initialValue as string[])[0] || '', (initialValue as string[])[1] || '']}
	<div class="flex flex-col gap-1.5">
		<Input
			size="xs"
			placeholder="key"
			value={keyValue[0]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[0] = value;
				onValue(keyValue);
			}}
		/>
		<Input
			size="xs"
			placeholder="value"
			value={keyValue[1]}
			onchange={(evt) => {
				const { value } = evt.target as HTMLInputElement;
				keyValue[1] = value;
				onValue(keyValue);
			}}
		/>
	</div>
{/snippet}
