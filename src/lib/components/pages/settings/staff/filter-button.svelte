<script lang="ts">
	import { T } from '$i18n';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { type GraphqlPaginableTableInterface } from '$lib/components/ui/Table';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		StaffMemberStatus,
		type QueryStaffUsersArgs,
		type StaffUserInput,
	} from '$lib/gql/graphql';
	import { set } from 'es-toolkit/compat';

	type Props = {
		variables: QueryStaffUsersArgs;
		tableRef?: GraphqlPaginableTableInterface;
	};

	let { variables = $bindable(), tableRef }: Props = $props();

	const FilterOptions: FilterProps<StaffUserInput> = $derived({
		status: {
			label: $T('staff.status'),
			operations: {
				eq: statusSingle,
			},
		},
	});

	const STATUS_OPTIONS = Object.keys(StaffMemberStatus).map((key) => ({
		label: key,
		value: StaffMemberStatus[key as keyof typeof StaffMemberStatus],
	}));
</script>

{#snippet statusSingle({ onValue, initialValue }: FilterComponentType)}
	<Select
		options={STATUS_OPTIONS}
		value={initialValue as string}
		onchange={(value) => value && onValue((value as SelectOption).value as StaffMemberStatus)}
		placeholder={$T('staff.status')}
		size="xs"
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	onRefetchData={() => tableRef?.triggerFetchData()}
	searchKey="filter.search"
	variablePatchingCallbackAfterReload={(vars, searchParams) => {
		if (searchParams.status) {
			set(vars, 'filter.status', searchParams.status.value);
		}
		return vars;
	}}
/>
