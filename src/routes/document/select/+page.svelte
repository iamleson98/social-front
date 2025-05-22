<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { Select } from '$lib/components/ui/select';
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import { toast } from 'svelte-sonner';

	const variants = ['info', 'success', 'warning', 'error'] as const;
	const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

	let generalVariant = $state<'info' | 'error' | 'warning' | 'success'>('info');
	let graphqlVariant = $state<'info' | 'error' | 'warning' | 'success'>('info');

	let sizeGeneralSelect = $state<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
	let sizeGraphqlPaginableSelect = $state<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

	let value = $state<string[]>();
	let disabled = $state(false);
	let isMultiple = $state(false);

	let disabledGraphqlPaginableSelect = $state(false);
	let isMultipleGraphqlPaginableSelect = $state(false);

	const handleCopyGeneralSelect = () => {
		let codeContent = `<Select
			size="${sizeGeneralSelect}"
			label="GeneralSelect"
			${isMultiple ? 'multiple' : ''}
			${disabled ? 'disabled' : ''}
			variant="${generalVariant}"
			subText="${generalVariant}"
			maxDisplay={1}
			options={[
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
				{ label: 'Option 3', value: '3' }
			]}
			showLoadingMore
			bind:value
			onchange={console.log}
			/>`;

		navigator.clipboard.writeText(codeContent).then(() => {
			toast.success(`Copied code: ${codeContent}`);
		});
	};

	const handleCopyGraphqlPaginableSelect = () => {
		const gqlContent = `<GraphqlPaginableSelect
			query={PRODUCT_LIST_QUERY_ADMIN}
			variables={{
				first: 20,
				filter: { search: '' }
			} as QueryProductsArgs}
			resultKey="products"
			optionValueKey="id"
			optionLabelKey="name"
			label="Product"
			required
			${isMultipleGraphqlPaginableSelect ? 'multiple' : ''}
			${disabledGraphqlPaginableSelect ? 'disabled' : ''}
			variant="${graphqlVariant}"
			subText="${graphqlVariant}"
			variableSearchQueryPath="filter.search"
			bind:value
			size="${sizeGraphqlPaginableSelect}"
		/>`;

		navigator.clipboard.writeText(gqlContent).then(() => {
			toast.success(`Copied code: ${gqlContent}`);
		});
	};
</script>

<svelte:head>
	<link rel="stylesheet" href="https://esm.sh/@wooorm/starry-night@3/style/both" />
</svelte:head>

<div class="bg-white rounded-md border border-gray-200 p-2">
	<h1 class="p-2">General Select</h1>

	<Checkbox bind:checked={isMultiple} label="Multiple" class="mb-2" />
	<Checkbox bind:checked={disabled} label="Disabled" class="mb-2" />

	<div class="flex gap-4 flex-wrap mb-2">
		{#each variants as variant}
			<label>
				<input type="radio" bind:group={generalVariant} value={variant} />
				<span class="ml-1">{variant}</span>
			</label>
		{/each}
	</div>

	<div class="flex gap-4 flex-wrap mb-2">
		{#each sizes as size}
			<label>
				<input type="radio" bind:group={sizeGeneralSelect} value={size} />
				<span class="ml-1">{size}</span>
			</label>
		{/each}
	</div>

	<Select
		size={sizeGeneralSelect}
		label="GeneralSelect"
		multiple={isMultiple}
		variant={generalVariant}
		subText={`variant ${generalVariant}`}
		{disabled}
		onchange={console.log}
		maxDisplay={1}
		options={[
			{ label: 'Option 1', value: '1' },
			{ label: 'Option 2', value: '2' },
			{ label: 'Option 3', value: '3' },
		]}
		bind:value
	/>
	<Button class="mt-2" onclick={handleCopyGeneralSelect}>Copy GeneralSelect</Button>
</div>

<div class="bg-white rounded-md border border-gray-200 p-2 mt-5">
	<h1 class="mb-2">GraphQL Select</h1>

	<Checkbox bind:checked={isMultipleGraphqlPaginableSelect} label="Multiple" class="mb-2" />
	<Checkbox bind:checked={disabledGraphqlPaginableSelect} label="Disabled" class="mb-2" />

	<div class="flex gap-4 flex-wrap mb-2">
		{#each variants as variant}
			<label>
				<input type="radio" bind:group={graphqlVariant} value={variant} />
				<span class="ml-1">{variant}</span>
			</label>
		{/each}
	</div>

	<div class="flex gap-4 flex-wrap mb-2">
		{#each sizes as size}
			<label>
				<input type="radio" bind:group={sizeGraphqlPaginableSelect} value={size} />
				<span class="ml-1">{size}</span>
			</label>
		{/each}
	</div>

	<GraphqlPaginableSelect
		query={PRODUCT_LIST_QUERY_ADMIN}
		variables={{
			first: 20,
			filter: { search: '' },
		} as QueryProductsArgs}
		resultKey="products"
		optionValueKey="id"
		optionLabelKey="name"
		label="Product"
		required
		bind:value
		variant={graphqlVariant}
		subText={`variant ${graphqlVariant}`}
		disabled={disabledGraphqlPaginableSelect}
		multiple={isMultipleGraphqlPaginableSelect}
		variableSearchQueryPath="filter.search"
		size={sizeGraphqlPaginableSelect}
	/>
	<Button class="mt-2" onclick={handleCopyGraphqlPaginableSelect}>Copy GraphqlPaginableSelect</Button>
</div>
