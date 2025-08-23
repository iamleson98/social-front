<script lang="ts">
	import { tranFunc } from '$i18n';
	import Thumbnail from '$lib/components/common/thumbnail.svelte';
	import { BadgeOutline, Icon } from '$lib/components/icons';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import dayjs from 'dayjs';
	import { boolean, object, string, z } from 'zod';

	type Props = {
		avatar?: string;
		lastName: string;
		firstName: string;
		email: string;
		disabled: boolean;
		isActive: boolean;
		formOk?: boolean;
		isCreatePage: boolean;
		dateJoined?: string;
		/** indicate if current user can edit given staff */
		canEdit?: boolean;
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
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const staffSchema = object({
		avatar: string().optional(),
		lastName: string().nonempty(REQUIRED_ERROR),
		firstName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		isActive: boolean(),
	});

	type StaffSchema = z.infer<typeof staffSchema>;

	let staffFormErrors = $state.raw<Partial<Record<keyof StaffSchema, string[]>>>({});

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
</script>

<div class="h-full {SitenameTimeFormat}">
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

	<div class="mt-3 flex gap-3 items-center">
		<Checkbox label={$tranFunc('staff.active')} bind:checked={isActive} {disabled} class="flex-1" />
	</div>
</div>
