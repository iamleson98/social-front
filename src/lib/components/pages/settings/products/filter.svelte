<script lang="ts">
	import { FilterButton } from '$lib/components/common/filter-box';
	import type {
		FilterComponentType,
		FilterProps,
		SingleFilter
	} from '$lib/components/common/filter-box/types';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';

	const FILTER_OPTIONS: FilterProps[] = [
		{
			label: 'Price',
			key: 'price',
			operation: [
				{
					operator: 'is',
					component: priceCmp
				},
				{
					operator: 'lower',
					component: priceCmp
				},
				{
					operator: 'greater',
					component: priceCmp
				},
				{
					operator: 'between',
					component: priceBetween
				}
			]
		},
		{
			label: 'Category',
			key: 'category',
			operation: [
				{
					operator: 'is',
					component: categoryIs
				}
			]
		}
	];

	let filters = $state<SingleFilter[]>([]);
</script>

{#snippet priceCmp({ onValue, initialValue }: FilterComponentType)}
	<Input
		size="xs"
		placeholder="Enter price"
		type="number"
		min="0"
		value={initialValue}
		inputDebounceOption={{
			onInput: (evt) => onValue(((evt as Event).target as HTMLInputElement).value)
		}}
	/>
{/snippet}

{#snippet priceBetween({ onValue, initialValue }: FilterComponentType)}
	{@const bounds = ['', '']}
	<div class="flex gap-1 flex-col">
		<Input
			size="xs"
			class="w-full"
			placeholder=">="
			type="number"
			min="0"
			value={(initialValue as string[])?.[0]}
			inputDebounceOption={{
				onInput: (evt) => {
					bounds[0] = ((evt as Event).target as HTMLInputElement).value;
					onValue(bounds);
				}
			}}
		/>
		<Input
			size="xs"
			placeholder="<="
			class="w-full"
			type="number"
			min="0"
			value={(initialValue as string[])?.[1]}
			inputDebounceOption={{
				onInput: (evt) => {
					bounds[1] = ((evt as Event).target as HTMLInputElement).value;
					onValue(bounds);
				}
			}}
		/>
	</div>
{/snippet}

{#snippet categoryIs({ onValue }: FilterComponentType)}
	<Select options={[]} size="xs" />
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} onApply={(flts) => (filters = flts)} />
