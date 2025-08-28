<script lang="ts">
	import { PRODUCT_LIST_QUERY } from '$lib/api';
	import { Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, Select, type SelectOption } from '$lib/components/ui/select';
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import { get, readable, readonly, writable } from 'svelte/store';

	const options: SelectOption[] = [
		{
			label: 'one',
			value: 'one',
		},
		{
			label: 'two',
			value: 'two',
		},
	];

	const store = writable(2);
	const read = readonly(store);

	const lol = $derived(read);

	$effect(() => {
		console.log(lol);
	});
</script>

<!-- <Select multiple {options} onNotFoundQuerySelected={console.log} onblur={console.log} />-->

<!-- <Input onblur={console.log} /> -->

<button onclick={() => $store++}>add</button>
