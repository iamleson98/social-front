<script lang="ts">
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { Select } from '$lib/components/ui/select';
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';

	let generalVariant = $state<'info' | 'error' | 'warning' | 'success'>('info');
	let graphqlVariant = $state<'info' | 'error' | 'warning' | 'success'>('info');

	let value = $state<string[]>();
	let disabled = $state(false);
	let isMultiple = $state(false);

	let disabledGraphqlPaginableSelect = $state(false);
	let isMultipleGraphqlPaginableSelect = $state(false);

	const handleCopyGeneralSelect = () => {
		let codeContent = '';

		const commonProps = `
			size="sm"
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
			onchange={console.log}`;

		codeContent = `<Select${commonProps}\n/>`;

		navigator.clipboard.writeText(codeContent).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${codeContent}`,
				timeout: 5000,
			});
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
		/>`;

		navigator.clipboard.writeText(gqlContent).then(() => {
			toastStore.send({
				variant: 'success',
				message: `Copied code: ${gqlContent}`,
				timeout: 5000,
			});
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
		<label>
			<input type="radio" bind:group={generalVariant} value="info" />
			<span class="ml-1">Info</span>
		</label>
		<label>
			<input type="radio" bind:group={generalVariant} value="success" />
			<span class="ml-1">Success</span>
		</label>
		<label>
			<input type="radio" bind:group={generalVariant} value="warning" />
			<span class="ml-1">Warning</span>
		</label>
		<label>
			<input type="radio" bind:group={generalVariant} value="error" />
			<span class="ml-1">Error</span>
		</label>
	</div>

	<Select
		size="sm"
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
		<label>
			<input type="radio" bind:group={graphqlVariant} value="info" />
			<span class="ml-1">Info</span>
		</label>
		<label>
			<input type="radio" bind:group={graphqlVariant} value="success" />
			<span class="ml-1">Success</span>
		</label>
		<label>
			<input type="radio" bind:group={graphqlVariant} value="warning" />
			<span class="ml-1">Warning</span>
		</label>
		<label>
			<input type="radio" bind:group={graphqlVariant} value="error" />
			<span class="ml-1">Error</span>
		</label>
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
	/>
	<Button class="mt-2" onclick={handleCopyGraphqlPaginableSelect}
		>Copy GraphqlPaginableSelect</Button
	>
</div>
