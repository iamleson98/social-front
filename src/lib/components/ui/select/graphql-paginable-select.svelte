<script lang="ts" generics="T">
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import Select from './select.svelte';
	import type { CountableConnection, GraphqlPaginationArgs } from '../Table';
	import type { PageInfo, Query } from '$lib/gql/graphql';
	import type { SelectOption, SelectProps } from './types';
	import SelectSkeleton from './select-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { get, has, set } from 'es-toolkit/compat';
	import { GRAPHQL_CLIENT } from '$lib/api/client';

	type Props = {
		query: TypedDocumentNode<any, AnyVariables & GraphqlPaginationArgs>;
		variables: AnyVariables & GraphqlPaginationArgs;
		/** default to 'network-only' */
		requestPolicy?: RequestPolicy;
		/** for example the products query support pagination, then you must pass 'products' as resultKey */
		resultKey: keyof Query;
		/** the key of the option value, for example 'id' */
		optionValueKey: keyof T;
		/** the key of the option label, for example 'name' */
		optionLabelKey: keyof T;
		/** the path to the search query variable.
		 * For example:
		 *
		 * ```ts
		 * type QueryVariables = {
		 * 		filter?: {
		 * 			search?: string;
		 * 		}
		 * 		first?: number;
		 * };
		 *
		 * variableSearchQueryPath = 'filter.search'
		 * ```
		 */
		variableSearchQueryPath?: string;
	} & Omit<SelectProps, 'options'>;

	let {
		query,
		variables = $bindable(),
		requestPolicy = 'network-only',
		resultKey,
		variableSearchQueryPath,
		size = 'md',
		label,
		value = $bindable<SelectProps['value']>(),
		optionValueKey,
		optionLabelKey,
		onchange,
		...rest
	}: Props = $props();

	let selectOptions = $state.raw<SelectOption[]>([]);
	let isFetchingMore = $state(true);
	let pageInfo = $state.raw<PageInfo>();
	let errorMessage = $state();
	let isInitialFetch = $state(true);

	const fetchData = async () => {
		const result = await GRAPHQL_CLIENT.query<Pick<Query, typeof resultKey>>(query, variables, {
			requestPolicy,
		});
		if (result.error) {
			errorMessage = result.error.message;
			return;
		}

		if (!result.data) return;

		const connection: CountableConnection<T> = get(result.data, resultKey);
		if (!connection) throw new Error(`invalid result key: ${resultKey}`);

		pageInfo = connection.pageInfo;

		const selections = connection.edges.reduce<SelectOption[]>((acc, { node }) => {
			const value = get(node, optionValueKey);
			const label = get(node, optionLabelKey);
			if (!value || !label) return acc;

			acc.push({ value, label });
			return acc;
		}, []);

		selectOptions = selectOptions.concat(selections);
	};

	$effect(() => {
		if (isFetchingMore) {
			fetchData().finally(() => {
				isFetchingMore = false;
				isInitialFetch = false;
			});
		}
	});

	const onInput = (evt: Event) => {
		if (!variableSearchQueryPath) return;

		let value = '';

		if (evt.target) {
			value = (evt.target as HTMLInputElement).value.trim();
		} else if (evt.currentTarget) {
			value = (evt.currentTarget as HTMLInputElement).value.trim();
		}

		if (!has(variables, variableSearchQueryPath)) {
			throw new Error(`variableSearchQueryPath ${variableSearchQueryPath} not found in variables`);
		}

		const newVariables = { ...variables, after: null };
		set(newVariables, variableSearchQueryPath, value);

		variables = newVariables;
		selectOptions = [];
		isFetchingMore = true;
	};

	const onScrollToEnd = () => {
		if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;

		variables = {
			...variables,
			after: pageInfo.endCursor,
		};
		isFetchingMore = true;
	};
</script>

{#if isInitialFetch}
	<SelectSkeleton label={!!label} {size} />
{:else if errorMessage}
	<Alert variant="error" {size} bordered>{errorMessage}</Alert>
{:else}
	<Select
		{...rest}
		bind:value
		options={selectOptions}
		{onchange}
		{size}
		{label}
		inputDebounceOption={{ onInput }}
		{onScrollToEnd}
		{isFetchingMore}
	/>
{/if}
