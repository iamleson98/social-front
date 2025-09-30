<script lang="ts">
	import { FilterManager } from '$lib/components/common/filter-box';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box/types';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import type { CustomerFilterInput, QueryCustomersArgs } from '$lib/gql/graphql';
	import { BASIC_DATE_FORMAT } from '$lib/utils/consts';
	import dayjs from 'dayjs';

	type Props = {
		variables: QueryCustomersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const THIS_YEAR = new Date().getFullYear();

	const FilterOptions: FilterProps<CustomerFilterInput> = {
		dateJoined: {
			label: 'Join date',
			operations: {
				lte: joinDateSingle,
				gte: joinDateSingle,
				range: joinDateBetween,
			},
		},
		numberOfOrders: {
			label: 'Number of orders',
			operations: {
				eq: numberOfOrdersSingle,
				gte: numberOfOrdersSingle,
				lte: numberOfOrdersSingle,
				range: numberOfOrdersBetween,
			},
		},
		metadata: {
			label: 'Metadata',
			operations: {
				eq: metadataComponent,
			},
		},
	};
</script>

{#snippet joinDateSingle({ onValue, initialValue, placeholder }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		value={{ date: initialValue as string }}
		onchange={(value) => {
			onValue(dayjs(value.date).format(BASIC_DATE_FORMAT));
		}}
		{placeholder}
		timeConfig={false}
		autoApply={false}
		allowSelectMonthYears={{
			showMonths: true,
			showYears: {
				min: 2010,
				max: THIS_YEAR,
			},
		}}
	/>
{/snippet}

{#snippet joinDateBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || ['', '']) as string[]}
	<div class="flex flex-col gap-1">
		{@render joinDateSingle({
			onValue: (value) => {
				range[0] = value as string;
				onValue(range);
			},
			initialValue: range[0],
			placeholder: 'Start date',
		})}
		{@render joinDateSingle({
			onValue: (value) => {
				range[1] = value as string;
				onValue(range);
			},
			initialValue: range[1],
			placeholder: 'End date',
		})}
	</div>
{/snippet}

{#snippet numberOfOrdersSingle({ onValue, initialValue, placeholder }: FilterComponentType)}
	<Input
		size="xs"
		type="number"
		min="0"
		value={initialValue as string}
		onchange={(evt) => onValue(parseInt((evt.target as HTMLInputElement).value))}
		{placeholder}
	/>
{/snippet}

{#snippet numberOfOrdersBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || []) as number[]}
	<div class="flex flex-col gap-1">
		{@render numberOfOrdersSingle({
			onValue: (value) => {
				range[0] = value as number;
				onValue(range);
			},
			initialValue: range[0],
			placeholder: 'From',
		})}
		{@render numberOfOrdersSingle({
			onValue: (value) => {
				range[1] = value as number;
				onValue(range);
			},
			initialValue: range[1],
			placeholder: 'To',
		})}
	</div>
{/snippet}

{#snippet metadataComponent({ onValue, initialValue = [] }: FilterComponentType)}
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

<FilterManager
	filterOptions={FilterOptions}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey={'filter.search' as keyof QueryCustomersArgs}
	variablePatchingCallbackAfterReload={(variables, searchParams) => {
		const { dateJoined, numberOfOrders, metadata } = searchParams;

		if (!variables.filter) variables.filter = {};

		if (dateJoined) {
			if (dateJoined.operator === 'range' && Array.isArray(dateJoined.value))
				variables.filter.dateJoined = {
					gte: dateJoined.value[0],
					lte: dateJoined.value[1],
				};
			else if (['lte', 'gte'].includes(dateJoined.operator)) {
				variables.filter.dateJoined = { [dateJoined.operator]: dateJoined.value };
			}
		}

		if (numberOfOrders) {
			if (numberOfOrders.operator === 'eq')
				variables.filter.numberOfOrders = {
					gte: numberOfOrders.value as number,
					lte: numberOfOrders.value as number,
				};
			else if (['lte', 'gte'].includes(numberOfOrders.operator))
				variables.filter.numberOfOrders = { [numberOfOrders.operator]: numberOfOrders.value };
			else if (numberOfOrders.operator === 'range' && Array.isArray(numberOfOrders.value))
				variables.filter.numberOfOrders = {
					gte: numberOfOrders.value[0] as number,
					lte: numberOfOrders.value[1] as number,
				};
		}

		if (metadata) {
			if (metadata.operator === 'eq') {
				variables.filter.metadata = [
					{
						key: (metadata.value as string[])[0],
						value: (metadata.value as string[])[1],
					},
				];
			}
		}

		return variables;
	}}
/>
