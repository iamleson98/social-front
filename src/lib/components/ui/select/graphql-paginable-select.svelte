<script lang="ts" generics="T">
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import type { CountableConnection, GraphqlPaginationArgs } from '../Table';
	import type { PageInfo, Query } from '$lib/gql/graphql';
	import type { MultiSelectProps, SelectOption, SelectProps } from './types';
	import SelectSkeleton from './select-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { get, has, set } from 'es-toolkit/compat';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import GeneralSelect from './general-select.svelte';

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
	} & Omit<MultiSelectProps, 'options'>;

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
	let pageInfo = $state.raw<PageInfo>();
	let errorMessage = $state();
	let isInitialFetch = $state(true);
	let forceFetching = $state(true);

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
		const selections: SelectOption[] = [];
		for (const edge of connection.edges) {
			const value = get(edge.node, optionValueKey);
			const label = get(edge.node, optionLabelKey);
			if (!value || !label) continue;

			selections.push({ value, label });
		}

		selectOptions = selectOptions.concat(selections);
	};

	$effect(() => {
		if (forceFetching) {
			fetchData().finally(() => {
				forceFetching = false;
				isInitialFetch = false;
			});
		}
	});

	const onInput = (value: string = '') => {
		if (!variableSearchQueryPath || !has(variables, variableSearchQueryPath)) return;

		const newVariables = { ...variables };
		delete newVariables['after'];
		set(newVariables, variableSearchQueryPath, value);

		variables = newVariables;
		selectOptions = [];
		forceFetching = true; // trigger fetch over again
	};

	const onScrollToEnd = () => {
		if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;

		variables = {
			...variables,
			after: pageInfo.endCursor,
		};
		forceFetching = true; // trigger fetch over again
	};
</script>

{#if isInitialFetch}
	<SelectSkeleton label={!!label} {size} />
{:else if errorMessage}
	<Alert variant="error" {size} bordered>{errorMessage}</Alert>
{:else}
	<GeneralSelect
		bind:value
		options={selectOptions}
		{onchange}
		{size}
		{label}
		inputDebounceOption={{
			onInput: (evt) => onInput((evt.target as HTMLInputElement).value.trim()),
		}}
		{onScrollToEnd}
		showLoadingMore={forceFetching}
		onclearInputField={onInput}
		{...rest}
	/>
{/if}
