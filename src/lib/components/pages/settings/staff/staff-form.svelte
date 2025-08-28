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
	import dayjs from 'dayjs';
	import { difference } from 'es-toolkit';
	import { boolean, object, string, z } from 'zod';

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
		lastName: string().nonempty(CommonState.FieldRequiredError),
		firstName: string().nonempty(CommonState.FieldRequiredError),
		email: string().nonempty(CommonState.FieldRequiredError).email($tranFunc('error.invalidEmail')),
		isActive: boolean(),
	});

	type StaffSchema = z.infer<typeof staffSchema>;

	let staffFormErrors = $state.raw<Partial<Record<keyof StaffSchema, string[]>>>({});
	let displayingGroups = $state(existingGroups);

	const validate = () => {
		const parseResult = staffSchema.safeParse({
			lastName,
			firstName,
			email,
			isActive,
		});

		formOk = parseResult.success;
		staffFormErrors = parseResult.success ? {} : parseResult.error?.formErrors.fieldErrors;
	};

	const handlePermissionGroupChange = (opts?: SelectOption | SelectOption[]) => {
		if (!opts) return;

		const newAddGroups = difference(displayingGroups, existingGroups);
		const newRemoveGroups = difference(existingGroups, displayingGroups);

		addGroups = newAddGroups;
		removeGroups = newRemoveGroups;
	};
</script>

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
			inputDebounceOption={{ onInput: validate }}
			variant={staffFormErrors?.lastName?.length ? 'error' : 'info'}
			subText={staffFormErrors?.lastName?.length ? staffFormErrors.lastName[0] : ''}
			required
			{disabled}
			readonly={!isCreatePage && !canEdit}
			class="flex-1"
			onblur={validate}
		/>
		<Input
			label={$tranFunc('common.firstName')}
			bind:value={firstName}
			inputDebounceOption={{ onInput: validate }}
			variant={staffFormErrors?.firstName?.length ? 'error' : 'info'}
			subText={staffFormErrors?.firstName?.length ? staffFormErrors.firstName[0] : ''}
			required
			{disabled}
			readonly={!isCreatePage && !canEdit}
			class="flex-1"
			onblur={validate}
		/>
	</div>
	<Input
		label={$tranFunc('common.email')}
		bind:value={email}
		class="flex-1 mt-3"
		required
		variant={staffFormErrors?.email?.length ? 'error' : 'info'}
		subText={staffFormErrors?.email?.length ? staffFormErrors.email[0] : ''}
		{disabled}
		readonly={!isCreatePage && !canEdit}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
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
