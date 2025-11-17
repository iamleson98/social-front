<script lang="ts">
	import { tranFunc } from '$i18n';
	import { STAFFS_QUERY } from '$lib/api/admin/staff';
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { Plus, Search, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import {
		GraphqlPaginableTable,
		reFetchTableData,
		Table,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { type Channel, type QueryStaffUsersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { addNoDup, SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { difference } from 'es-toolkit';
	import { SvelteSet } from 'svelte/reactivity';
	import { array, object, string } from 'zod';

	type Props = {
		name: string;
		restrictedAccessToChannels: boolean;
		/** existing users of this group */
		users?: User[];
		disabled?: boolean;
		/** indicates if current user can edit this group */
		editable?: boolean;
		existingAccessibleChannels?: Channel[];
		addChannels?: string[];
		removeChannels?: string[];
		formOk?: boolean;
		addUsers?: string[];
		removeUsers?: string[];
	};

	let {
		name = $bindable(),
		restrictedAccessToChannels = $bindable(),
		users = [],
		disabled,
		editable = true,
		existingAccessibleChannels = [],
		addChannels = $bindable([]),
		removeChannels = $bindable([]),
		formOk = $bindable(true),
		addUsers = $bindable([]),
		removeUsers = $bindable([]),
	}: Props = $props();

	const ExistingChannelIds = existingAccessibleChannels.map((chan) => chan.id);

	const GroupSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		selectedChannels: array(string()).nonempty($CommonState.FieldRequiredError),
	});
	const SchemaHandler = createSchemaHandler(
		GroupSchema,
		() => ({ name, selectedChannels }),
		(ok) => (formOk = ok),
	);

	let openAssignUserModal = $state(false);
	let staffUsersVariables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let selectedChannels = $state<string[]>(ExistingChannelIds);
	let displayingUsers = $state(users);
	let innerSelectedUsersToUnassign = $state<SvelteSet<string>>(new SvelteSet());
	let innerSelectedUsersToAssign = $state<Record<string, User>>({});

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

	const UserColumns: TableColumnProps<User>[] = $derived([
		{
			title: $tranFunc('staff.avatar'),
			child: avatar,
		},
		{
			title: $tranFunc('common.name'),
			child: userName,
		},
		{
			title: $tranFunc('common.email'),
			child: email,
		},
	]);

	const handleChannelsChange = async () => {
		const newChansDiff = difference(selectedChannels, ExistingChannelIds);
		const removeChansDiff = difference(ExistingChannelIds, selectedChannels);

		if (newChansDiff.length) addChannels = addNoDup(addChannels, ...newChansDiff);
		if (removeChansDiff.length) removeChannels = addNoDup(removeChannels, ...removeChansDiff);
		SchemaHandler.validate();
	};

	const handleUnassignUsers = () => {
		const newUnassignUserIds: string[] = [];
		for (const id of innerSelectedUsersToUnassign) {
			delete innerSelectedUsersToAssign[id];
			if (users.some((user) => user.id === id)) {
				newUnassignUserIds.push(id);
			}
		}

		removeUsers = newUnassignUserIds;
		displayingUsers = displayingUsers.filter((user) => !innerSelectedUsersToUnassign.has(user.id));
		innerSelectedUsersToUnassign.clear();
	};

	const handleAssignUsers = () => {
		const newAddUsers: string[] = [];
		const addDisplayUsers: User[] = [];

		for (const key in innerSelectedUsersToAssign) {
			if (!users.some((user) => user.id === key)) {
				newAddUsers.push(key);
				addDisplayUsers.push(innerSelectedUsersToAssign[key]);
			}
		}
		addUsers = newAddUsers;
		displayingUsers = displayingUsers.concat(addDisplayUsers);
		openAssignUserModal = false;
	};
</script>

{#snippet selectUnassign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={innerSelectedUsersToUnassign.has(item.id)}
		onCheckChange={(checked) => {
			innerSelectedUsersToUnassign[checked ? 'add' : 'delete'](item.id);
		}}
		{disabled}
	/>
{/snippet}

{#snippet selectAssign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={!!innerSelectedUsersToAssign[item.id]}
		{disabled}
		onCheckChange={(checked) => {
			if (checked) {
				innerSelectedUsersToAssign[item.id] = item;
			} else {
				delete innerSelectedUsersToAssign[item.id];
			}
		}}
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
	<div class={SitenameCommonClassName}>
		<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>

		<Input
			placeholder={$tranFunc('common.name')}
			label={$tranFunc('common.name')}
			bind:value={name}
			required
			{disabled}
			readonly={!editable}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler.name?.[0]}
		/>
		<Checkbox
			label={$tranFunc('permissionGroup.restrictChanAccess')}
			bind:checked={restrictedAccessToChannels}
			readonly={!editable}
			{disabled}
		/>
		{#if restrictedAccessToChannels}
			<ChannelSelect
				placeholder={$tranFunc('channel.channels')}
				label={$tranFunc('permissionGroup.visibleOrderChanLabel')}
				required
				bind:value={selectedChannels}
				{disabled}
				multiple
				onchange={handleChannelsChange}
				valueType="id"
				onblur={SchemaHandler.validate}
				variant={$SchemaHandler.selectedChannels?.length ? 'error' : 'info'}
				subText={$SchemaHandler.selectedChannels?.[0]}
			/>
		{/if}
	</div>

	<div class={SitenameCommonClassName}>
		<SectionHeader>
			<div>{$tranFunc('permissionGroup.groupMembers')}</div>

			<div class="flex gap-1">
				<Button
					size="xs"
					variant="light"
					color="red"
					endIcon={Trash}
					disabled={disabled || !innerSelectedUsersToUnassign.size || !editable}
					onclick={handleUnassignUsers}
				>
					{$tranFunc('permissionGroup.unassignUsers')}
				</Button>
				<Button
					size="xs"
					variant="light"
					endIcon={Plus}
					onclick={() => {
						openAssignUserModal = true;
						reFetchTableData(TableNameKeys.PermissionGroupStaffTable);
					}}
					disabled={disabled || !editable}
				>
					{$tranFunc('permissionGroup.assignUsers')}
				</Button>
			</div>
		</SectionHeader>

		<Table columns={UnassignSelectColumn.concat(UserColumns)} items={displayingUsers} {disabled} />
	</div>
</div>

<Modal
	open={openAssignUserModal}
	header={$tranFunc('permissionGroup.assignUsers')}
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignUserModal = false)}
	onCancel={() => (openAssignUserModal = false)}
	disableOkBtn={!Object.keys(innerSelectedUsersToAssign).length || !editable}
	onOk={handleAssignUsers}
>
	<Input
		placeholder={$tranFunc('common.search')}
		class="mb-2"
		bind:value={staffUsersVariables.filter!.search}
		startIcon={Search}
		inputDebounceOption={{
			debounceTime: 888,
			onInput: () => reFetchTableData(TableNameKeys.PermissionGroupStaffTable),
		}}
	/>
	<GraphqlPaginableTable
		columns={AssignSelectColumn.concat(UserColumns)}
		query={STAFFS_QUERY}
		resultKey="staffUsers"
		bind:variables={staffUsersVariables}
		tableName={TableNameKeys.PermissionGroupStaffTable}
		autoRefetchOnPaginationParamsChange
	/>
</Modal>
