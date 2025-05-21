<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_LIST_QUERY_ADMIN } from '$lib/api/admin/product';
	import { Button } from '$lib/components/ui';
	import { Checkbox } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect } from '$lib/components/ui/select';
	import { Select } from '$lib/components/ui/select';
	import SelectSkeleton from '$lib/components/ui/select/select-skeleton.svelte';
	import { type QueryProductsArgs } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';

	let value = $state<string[]>();
	let isError = $state(false);
	let isWarning = $state(false);
	let disabled = $state(false);
	let isMultiple = $state(false);

	let isErrorGraphqlPaginableSelect = $state(false);
	let isWarningGraphqlPaginableSelect = $state(false);
	let loadingGraphqlPaginableSelect = $state(false);
	let disabledGraphqlPaginableSelect = $state(false);
	let isMultipleGraphqlPaginableSelect = $state(false);

	const handleCopyGeneralSelect = () => {
		let codeContent = '';

		const commonProps = `
			size="sm"
			label="GeneralSelect"
			${isMultiple ? 'multiple' : ''}
			${disabled ? 'disabled' : ''}
			variant="${isError ? 'error' : isWarning ? 'warning' : 'info'}"
			subText="${isError ? 'variant error' : isWarning ? 'variant warning' : ''}"
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
			variant="${isErrorGraphqlPaginableSelect ? 'error' : isWarningGraphqlPaginableSelect ? 'warning' : 'info'}"
			subText="${isErrorGraphqlPaginableSelect ? 'variant error' : isWarningGraphqlPaginableSelect ? 'variant warning' : ''}"
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

<div class="flex flex-col gap-3">
	<!-- General Select -->
	<div class="bg-white rounded-md border border-gray-200 p-2">
		<h1 class="p-2">General Select</h1>
		<Checkbox bind:checked={isMultiple} label="Multiple" class="mb-2" />
		<Checkbox bind:checked={isError} label="Error" class="mb-2" />
		<Checkbox bind:checked={isWarning} label="Warning" class="mb-2" />
		<Checkbox bind:checked={disabled} label="Disabled" class="mb-2" />
		<Select
			size="sm"
			label="GeneralSelect"
			multiple={isMultiple}
			variant={isError ? 'error' : isWarning ? 'warning' : 'info'}
			subText={isError ? 'variant error' : isWarning ? 'variant warning' : undefined}
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

	<!-- GraphQL Select -->
	<div class="bg-white rounded-md border border-gray-200 p-2">
		<h1 class="mb-2">GraphQL Select</h1>
		<Checkbox bind:checked={isMultipleGraphqlPaginableSelect} label="Multiple" class="mb-2" />
		<Checkbox bind:checked={isErrorGraphqlPaginableSelect} label="Error" class="mb-2" />
		<Checkbox bind:checked={isWarningGraphqlPaginableSelect} label="Warning" class="mb-2" />
		<Checkbox bind:checked={disabledGraphqlPaginableSelect} label="Disabled" class="mb-2" />
		<GraphqlPaginableSelect
			query={PRODUCT_LIST_QUERY_ADMIN}
			variables={{
				first: 20,
				filter: {
					search: '',
				},
			} as QueryProductsArgs}
			resultKey="products"
			optionValueKey="id"
			optionLabelKey="name"
			label="Product"
			required
			bind:value
			variant={isErrorGraphqlPaginableSelect
				? 'error'
				: isWarningGraphqlPaginableSelect
					? 'warning'
					: 'info'}
			subText={isErrorGraphqlPaginableSelect
				? 'variant error'
				: isWarningGraphqlPaginableSelect
					? 'variant warning'
					: undefined}
			disabled={disabledGraphqlPaginableSelect}
			multiple={isMultipleGraphqlPaginableSelect}
			variableSearchQueryPath="filter.search"
		/>
		<Button class="mt-2" onclick={handleCopyGraphqlPaginableSelect}>Copy GraphqlPaginableSelect</Button>
	</div>
</div>
