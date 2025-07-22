<script lang="ts">
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Search } from '$lib/components/icons';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, type TableColumnProps } from '$lib/components/ui/Table';
	import type { QueryStaffUsersArgs, User } from '$lib/gql/graphql';
	import { toggleItemNoDup } from '$lib/utils/utils';
	import { avatar, email, userName } from './snippets.svelte';

	type Props = {
		addUsers: string[];
		disabled?: boolean;
		editable?: boolean;
	};

	let { addUsers = $bindable(), disabled, editable }: Props = $props();

	let staffUsersVariables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(false);

	const AssignSelectColumn: TableColumnProps<User>[] = [
		{
			title: '',
			child: selectAssign,
		},
	];

	const UserColumns: TableColumnProps<User>[] = [
		{
			title: 'Avatar',
			child: avatar,
		},
		{
			title: 'Name',
			child: userName,
		},
		{
			title: 'Email',
			child: email,
		},
	];
</script>

{#snippet selectAssign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={addUsers.includes(item.id)}
		onCheckChange={(checked) => {
			addUsers = toggleItemNoDup(addUsers, item.id, checked);
		}}
	/>
{/snippet}

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>
		<div>Group members</div>
	</SectionHeader>

	<Input
		placeholder="Search"
		class="mb-2"
		bind:value={staffUsersVariables.filter!.search}
		startIcon={Search}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: () => (forceReExecuteGraphqlQuery = true),
		}}
	/>
	<GraphqlPaginableTable
		columns={AssignSelectColumn.concat(UserColumns)}
		query={STAFFS_QUERY}
		resultKey="staffUsers"
		bind:variables={staffUsersVariables}
		bind:forceReExecuteGraphqlQuery
	/>
</div>
