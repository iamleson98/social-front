<script lang="ts">
	import { FilterButton } from '$lib/components/common/filter-box';
	import type {
		FilterComponentType,
		FilterProps,
		// SingleFilter
	} from '$lib/components/common/filter-box/types';
	import { Input } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import type { ProductFilterInput } from '$lib/gql/graphql';

	const FILTER_OPTIONS: FilterProps<ProductFilterInput>[] = [
		{
			label: 'Price',
			key: 'price',
			operation: [
				{
					operator: 'eq',
					component: priceCmp
				},
				{
					operator: 'lte',
					component: priceCmp
				},
				{
					operator: 'gte',
					component: priceCmp
				},
				{
					operator: 'range',
					component: priceBetween
				}
			]
		},
		// {
		// 	label: 'Category',
		// 	key: 'category',
		// 	operation: [
		// 		{
		// 			operator: 'is',
		// 			component: categoryIs
		// 		}
		// 	]
		// }
	];

	// let filters = $state<SingleFilter[]>([]);
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

<FilterButton filterOptions={FILTER_OPTIONS} />
