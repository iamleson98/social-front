<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PRODUCT_TYPES_QUERY } from '$lib/api/admin/product';
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, type SelectOption, type SelectProps } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query, QueryProductTypesArgs } from '$lib/gql/graphql';

	let {
		value = $bindable(),
		ok = $bindable(),
		class: className = '',
		...props
	}: Omit<SelectProps, 'options' | 'label'> & { ok: boolean } = $props();

	const productTypesQueryStore = operationStore<Pick<Query, 'productTypes'>, QueryProductTypesArgs>(
		{
			kind: 'query',
			query: PRODUCT_TYPES_QUERY,
			variables: {
				first: 100
			},
			requestPolicy: 'cache-and-network'
		}
	);

	let error = $state<string>();

	$effect(() => {
		ok = !!value;
	});

	const handleBlur = () => {
		error = value ? undefined : $tranFunc('helpText.fieldRequired');
	};
</script>

<div class={className}>
	{#if $productTypesQueryStore.fetching}
		<SkeletonContainer class="w-full">
			<Skeleton class="h-6 w-full" />
		</SkeletonContainer>
	{:else if $productTypesQueryStore.error}
		<Alert variant="error" size="sm" bordered>{$productTypesQueryStore.error.message}</Alert>
	{:else if $productTypesQueryStore.data?.productTypes}
		{@const options = $productTypesQueryStore.data.productTypes.edges.map<SelectOption>(
			({ node }) => ({ value: node.id, label: node.name })
		)}
		<Select
			{options}
			{...props}
			required
			bind:value
			label={$tranFunc('product.prdType')}
			variant={!ok && error ? 'error' : 'info'}
			subText={!ok && error ? error : undefined}
			onblur={handleBlur}
		/>
	{/if}
</div>
