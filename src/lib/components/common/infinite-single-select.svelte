<script lang="ts">
	import type { TypedDocumentNode } from '@urql/core';
	import type { SocialSize } from '../ui/common';
	import { operationStore } from '$lib/api/operation';
	import { Select } from '../ui/select';
	import { SkeletonContainer } from '../ui/Skeleton';
	import Skeleton from '../ui/Skeleton/skeleton.svelte';
	import { Alert } from '../ui/Alert';

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
		class: className = ''
	}: Props = $props();

	// const store = operationStore({
	// 	query,
	// 	variables,
	// 	requestPolicy: 'cache-and-network'
	// });
</script>
