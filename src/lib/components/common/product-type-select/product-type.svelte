<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { GraphqlPaginableSelect, type SelectProps } from '$lib/components/ui/select';
	import type { QueryProductTypesArgs } from '$lib/gql/graphql';

	let {
		value = $bindable(),
		ok = $bindable(),
		class: className = '',
		loading,
		...rest
	}: Omit<SelectProps, 'options' | 'label'> & { ok?: boolean; loading?: boolean } = $props();

	let error = $state<string>();

	$effect(() => {
		ok = !!value;
	});

	const handleBlur = () => {
		error = value ? undefined : $tranFunc('helpText.fieldRequired');
	};
</script>

<div class="{className} mb-3">
	<GraphqlPaginableSelect
		query={PRODUCT_TYPES_QUERY}
		variables={{
			first: 100,
			filter: {
				search: '',
			},
		} as QueryProductTypesArgs}
		resultKey="productTypes"
		optionValueKey="id"
		optionLabelKey="name"
		label={$tranFunc('product.prdType')}
		required
		bind:value
		variant={!ok && error ? 'error' : 'info'}
		subText={!ok && error ? error : undefined}
		onblur={handleBlur}
		disabled={loading}
		{...rest}
	/>
</div>
