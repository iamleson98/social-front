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
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type Channel, type QueryStaffUsersArgs, type User } from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { addNoDup, toggleItemNoDup } from '$lib/utils/utils';
	import { difference } from 'es-toolkit';
	import z, { array, object, string } from 'zod';

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

	const RequiredError = $tranFunc('helpText.fieldRequired');
	const GroupSchema = object({
		name: string().nonempty(RequiredError),
		selectedChannels: array(string()).nonempty(RequiredError),
	});

	type Group = z.infer<typeof GroupSchema>;

	let permissionGroupErrors = $state<Partial<Record<keyof Group, string[]>>>({});
	let openAssignUserModal = $state(false);
	let staffUsersVariables = $state<QueryStaffUsersArgs>({
		first: 10,
		filter: {
			search: '',
		},
	});
	let forceReExecuteGraphqlQuery = $state(false);
	let selectedChannels = $state<string[]>(existingAccessibleChannels.map((item) => item.id));
	let displayingUsers = $state(users);
	let innerSelectedUsersToUnassign = $state<string[]>([]);
	let innerSelectedUsersToAssign = $state<Record<string, User>>({});

	$effect(() => {
		formOk = !Object.values(permissionGroupErrors).length;
	});

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

	const validate = () => {
		const result = GroupSchema.safeParse({
			name,
			selectedChannels,
		});
		permissionGroupErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	const handleChannelsChange = async () => {
		const newChansDiff = difference(selectedChannels, ExistingChannelIds);
		const removeChansDiff = difference(ExistingChannelIds, selectedChannels);

		if (newChansDiff.length) addChannels = addNoDup(addChannels, ...newChansDiff);
		if (removeChansDiff.length) removeChannels = addNoDup(removeChannels, ...removeChansDiff);
		validate();
	};

	const handleUnassignUsers = () => {
		const newUnassignUserIds: string[] = [];
		for (const id of innerSelectedUsersToUnassign) {
			if (users.some((user) => user.id === id)) {
				newUnassignUserIds.push(id);
			}
		}

		removeUsers = addNoDup(removeUsers, ...newUnassignUserIds);
		displayingUsers = displayingUsers.filter((user) => !newUnassignUserIds.includes(user.id));
		innerSelectedUsersToUnassign = [];
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
		addUsers = addNoDup(addUsers, ...newAddUsers);
		displayingUsers = displayingUsers.concat(addDisplayUsers);
		openAssignUserModal = false;
		innerSelectedUsersToAssign = {};
	};

	$inspect(addUsers, removeUsers);
</script>

{#snippet selectUnassign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={innerSelectedUsersToUnassign.includes(item.id)}
		onCheckChange={(checked) => {
			innerSelectedUsersToUnassign = toggleItemNoDup(
				innerSelectedUsersToUnassign,
				item.id,
				checked,
			);
		}}
	/>
{/snippet}

{#snippet selectAssign({ item }: { item: User })}
	<Checkbox
		readonly={!editable || disabled}
		checked={!!innerSelectedUsersToAssign[item.id]}
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
	<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-3">
		<SectionHeader>General information</SectionHeader>

		<Input
			placeholder="Name"
			label="Name"
			bind:value={name}
			required
			readonly={!editable}
			onblur={validate}
			inputDebounceOption={{ onInput: validate }}
			variant={permissionGroupErrors?.name?.length ? 'error' : 'info'}
			subText={permissionGroupErrors?.name?.[0]}
		/>
		<Checkbox
			label="Restricted access to channels"
			bind:checked={restrictedAccessToChannels}
			readonly={!editable}
		/>
		{#if restrictedAccessToChannels}
			<ChannelSelect
				placeholder="Select channels"
				label="Select visible order channels"
				required
				bind:value={selectedChannels}
				multiple
				onchange={handleChannelsChange}
				valueType="id"
				onblur={validate}
				variant={permissionGroupErrors?.selectedChannels?.length ? 'error' : 'info'}
				subText={permissionGroupErrors?.selectedChannels?.[0]}
			/>
		{/if}
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
					disabled={disabled || !innerSelectedUsersToUnassign.length || !editable}
					onclick={handleUnassignUsers}
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

		<Table columns={UnassignSelectColumn.concat(UserColumns)} items={displayingUsers} />
	</div>
</div>

<Modal
	open={openAssignUserModal}
	header="Assign users"
	closeOnEscape
	closeOnOutsideClick
	onClose={() => (openAssignUserModal = false)}
	onCancel={() => (openAssignUserModal = false)}
	disableOkBtn={!Object.keys(innerSelectedUsersToAssign).length || !editable}
	onOk={handleAssignUsers}
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
