<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PERMISSION_GROUP_LIST_QUERY } from '$lib/api/admin/users';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { BadgeOutline, Icon } from '$lib/components/icons';
	import { Input, Toggle } from '$lib/components/ui/Input';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import { type QueryPermissionGroupsArgs } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import dayjs from 'dayjs';
	import { difference } from 'es-toolkit';
	import { boolean, object, string, email as zodEmail } from 'zod';

	type Props = {
		avatar?: string;
		lastName: string;
		firstName: string;
		email: string;
		disabled: boolean;
		isActive: boolean;
		formOk?: boolean;
		isCreatePage?: boolean;
		dateJoined?: string;
		/** indicate if current user can edit given staff */
		canEdit?: boolean;
		/** if not provided, meaning it is create page */
		existingGroups?: string[];
		addGroups: string[];
		removeGroups?: string[];
		isStaffManager?: boolean;
	};

	let {
		avatar = $bindable(''),
		lastName = $bindable(''),
		firstName = $bindable(''),
		email = $bindable(''),
		disabled,
		isActive = $bindable(false),
		formOk = $bindable(false),
		isCreatePage = false,
		dateJoined,
		canEdit,
		existingGroups = [],
		addGroups = $bindable([]),
		removeGroups = $bindable([]),
		isStaffManager,
	}: Props = $props();

	const staffSchema = object({
		avatar: string().optional(),
		lastName: string().nonempty($CommonState.FieldRequiredError),
		firstName: string().nonempty($CommonState.FieldRequiredError),
		email: zodEmail($CommonState.InvalidEmail).nonempty($CommonState.FieldRequiredError),
		isActive: boolean(),
	});

	const SchemaHandler = createSchemaHandler(
		staffSchema,
		() => ({
			lastName,
			firstName,
			email,
			isActive,
		}),
		(ok) => (formOk = ok),
	);

	let displayingGroups = $state(existingGroups);

	const handlePermissionGroupChange = (opts?: SelectOption | SelectOption[]) => {
		if (!opts) return;

		const newAddGroups = difference(displayingGroups, existingGroups);
		const newRemoveGroups = difference(existingGroups, displayingGroups);

		addGroups = newAddGroups;
		removeGroups = newRemoveGroups;
	};
</script>

<!-- fix lint warning -->
{void removeGroups}
{void addGroups}
{void formOk}

<div class="h-full {SitenameCommonClassName}">
	<div class="flex items-center gap-2">
		<Thumbnail
			src={avatar}
			alt={`${firstName[0] || email[0]}${lastName[0] || email[1]}`.toUpperCase()}
			size="lg"
		/>
		<div>
			<div class="flex items-center gap-1 text-sm text-gray-600">
				<Icon icon={BadgeOutline} class="text-blue-600" size="lg" />
				<span class="font-semibold">{$tranFunc('staff.staffs')}</span>
			</div>
			<div class="text-xs flex items-center gap-1 text-gray-600">
				<span class="font-semibold">{$tranFunc('staff.joinedSince')}:</span>
				<span>{dateJoined ? dayjs(dateJoined).format(SitenameTimeFormat) : '-'}</span>
			</div>
		</div>
	</div>

	<div class="flex gap-2 items-start mt-5">
		<Input
			label={$tranFunc('common.lastName')}
			bind:value={lastName}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.lastName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.lastName?.[0]}
			required
			{disabled}
			readonly={!isCreatePage && !canEdit}
			class="flex-1"
			onblur={SchemaHandler.validate}
		/>
		<Input
			label={$tranFunc('common.firstName')}
			bind:value={firstName}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			variant={$SchemaHandler.firstName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.firstName?.[0]}
			required
			{disabled}
			readonly={!isCreatePage && !canEdit}
			class="flex-1"
			onblur={SchemaHandler.validate}
		/>
	</div>
	<Input
		label={$tranFunc('common.email')}
		bind:value={email}
		class="flex-1 mt-3"
		required
		variant={$SchemaHandler.email?.length ? 'error' : 'info'}
		subText={$SchemaHandler.email?.[0]}
		{disabled}
		readonly={!isCreatePage && !canEdit}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
	/>

	<Toggle
		label={$tranFunc('staff.active')}
		bind:checked={isActive}
		disabled={!isStaffManager || disabled}
		class="flex-1"
	/>

	<GraphqlPaginableSelect
		query={PERMISSION_GROUP_LIST_QUERY}
		variables={{ first: 20, filter: { search: '' } } as QueryPermissionGroupsArgs}
		resultKey="permissionGroups"
		variableSearchQueryPath="filter.search"
		disabled={!isStaffManager || disabled}
		optionValueKey="id"
		optionLabelKey="name"
		requestPolicy="cache-and-network"
		multiple
		label="Permission Groups"
		placeholder="Permission groups"
		onchange={handlePermissionGroupChange}
		bind:value={displayingGroups}
	/>
</div>
