<script lang="ts">
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Plus, Search, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type QueryStaffUsersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { toggleItemNoDup } from '$lib/utils/utils';

	type Props = {
		name: string;
		restrictedAccessToChannels: boolean;
		users?: User[];
		disabled?: boolean;
		/** indicates if current user can edit this group */
		editable?: boolean;
	};

	let {
		name = $bindable(),
		restrictedAccessToChannels = $bindable(),
		users = [],
		disabled,
		editable = true,
	}: Props = $props();

	let selectedUsersToUnassign = $state<string[]>([]);
	let selectedUsersToAssign = $state<string[]>([]);
	let openAssignUserModal = $state(false);
	let staffUsersVariables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(false);

	const UnassignSelectColumn: TableColumnProps<User>[] = [
		{
			title: '',
			child: selectUnassign,
		},
	];

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

{#snippet selectUnassign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={selectedUsersToUnassign.includes(item.id)}
		onCheckChange={(checked) =>
			(selectedUsersToUnassign = toggleItemNoDup(selectedUsersToUnassign, item.id, checked))}
	/>
{/snippet}

{#snippet selectAssign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={selectedUsersToAssign.includes(item.id)}
		onCheckChange={(checked) =>
			(selectedUsersToAssign = toggleItemNoDup(selectedUsersToAssign, item.id, checked))}
	/>
{/snippet}

{#snippet avatar({ item }: { item: User })}
	<Thumbnail
		src={item.avatar?.url}
		alt={item.avatar?.alt || `${item.firstName} ${item.lastName}`}
		size="sm"
	/>
{/snippet}

{#snippet userName({ item }: { item: User })}
	<a href={AppRoute.SETTINGS_CONFIGS_USER_DETAILS(item.id)} class="link">
		{item.firstName}
		{item.lastName}
	</a>
{/snippet}

{#snippet email({ item }: { item: User })}
	<span>{item.email}</span>
{/snippet}

<div class="w-3/5 space-y-2">
	<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-3">
		<SectionHeader>General information</SectionHeader>

		<Input placeholder="Name" label="Name" bind:value={name} required readonly={!editable} />
		<Checkbox
			label="Restricted access to channels"
			bind:checked={restrictedAccessToChannels}
			readonly={!editable}
		/>
	</div>

	<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
		<SectionHeader>
			<div>Group members</div>

			<div class="flex gap-1">
				<Button
					size="xs"
					variant="light"
					color="red"
					endIcon={Trash}
					disabled={disabled || !selectedUsersToUnassign.length || !editable}
				>
					Unassign users
				</Button>
				<Button
					size="xs"
					variant="light"
					endIcon={Plus}
					onclick={() => {
						openAssignUserModal = true;
						forceReExecuteGraphqlQuery = true;
					}}
					disabled={disabled || !editable}
				>
					Assign users
				</Button>
			</div>
		</SectionHeader>

		<Table columns={UnassignSelectColumn.concat(UserColumns)} items={users} />
	</div>
</div>

<Modal
	open={openAssignUserModal}
	header="Assign users"
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignUserModal = false)}
	onCancel={() => (openAssignUserModal = false)}
	disableOkBtn={!selectedUsersToAssign.length || !editable}
>
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
</Modal>
