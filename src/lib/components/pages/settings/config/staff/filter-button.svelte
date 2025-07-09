<script lang="ts">
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

	type Props = {
		variables: QueryStaffUsersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const FILTER_OPTIONS: FilterProps<StaffUserInput>[] = [
		{
			label: 'Status',
			key: 'status',
			operations: [
				{
					operator: 'eq',
					component: statusSingle,
				},
			],
		},
	];

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
		placeholder="Status"
		size="xs"
	/>
{/snippet}

<FilterManager
	filterOptions={FILTER_OPTIONS}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey="filter.search"
/>
