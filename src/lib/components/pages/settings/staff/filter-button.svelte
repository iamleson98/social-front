<script lang="ts">
	import { tranFunc } from '$i18n';
	import {
		FilterManager,
		type FilterComponentType,
		type FilterProps,
	} from '$lib/components/common/filter-box';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import {
		StaffMemberStatus,
		type QueryStaffUsersArgs,
		type StaffUserInput,
	} from '$lib/gql/graphql';
	import { set } from 'es-toolkit/compat';

	type Props = {
		variables: QueryStaffUsersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<StaffUserInput> = $derived({
		status: {
			label: $tranFunc('staff.status'),
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
		placeholder={$tranFunc('staff.status')}
		size="xs"
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey="filter.search"
	extraVariablesFiltersPatching={(variables, searchParams) => {
		if (searchParams.status) {
			set(variables, 'filter.status', searchParams.status.value);
		}
		return variables;
	}}
/>
