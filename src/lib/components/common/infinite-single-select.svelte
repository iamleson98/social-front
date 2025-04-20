<script lang="ts">
	import type { TypedDocumentNode } from '@urql/core';
	import type { SocialSize } from '../ui/common';
	import { operationStore } from '$lib/api/operation';
	import { Select, type SelectOption } from '../ui/select';
	import { SkeletonContainer } from '../ui/Skeleton';
	import Skeleton from '../ui/Skeleton/skeleton.svelte';
	import { Alert } from '../ui/Alert';
	import { onMount } from 'svelte';
	import { GRAPHQL_CLIENT } from '$lib/api/client';

	type Props = {
		size?: SocialSize;
		query: TypedDocumentNode<any, any>;
		variables: any;
		label?: string;
		value?: string | number;
		class?: string;
		dataKey: string;
	};

	let {
		size = 'md',
		query,
		variables,
		value = $bindable(),
		class: className = '',
		dataKey
	}: Props = $props();

	let options = $state.raw<SelectOption[]>([]);
	let loading = $state(true);
	let error = $state<string>();

	onMount(async () => {
		const result = await GRAPHQL_CLIENT.query(query, variables, {
			requestPolicy: 'cache-and-network'
		});
		loading = false;
		if (result.error) {
			error = result.error.message;
			return;
		}
	});

	// const store = operationStore({
	// 	kind: 'query',
	// 	query,
	// 	variables,
	// 	requestPolicy: 'cache-and-network'
	// });
</script>

{#if loading}
	<SkeletonContainer class="h-full">
		<Skeleton class="h-4 w-full" />
	</SkeletonContainer>
{:else if error}
	<Alert variant="error" size="sm" bordered>
		{error}
	</Alert>
{:else if options}
	<Select {size} class={className} {value} {options} />
{/if}
