<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Checkbox, Input } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';

	type Props = {
    avatar?: string;
		lastName: string;
		firstName: string;
		email: string;
		disabled: boolean;
		isActive: boolean;
		formOk: boolean;
		isCreatePage?: boolean;
	};

	let {
    avatar = $bindable(''),
		lastName = $bindable(''),
		firstName = $bindable(''),
		email = $bindable(''),
		disabled,
		isActive = $bindable(false),
		formOk = $bindable(false),
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const channelSchema = object({
    avatar: string().optional(),
		lastName: string().nonempty(REQUIRED_ERROR),
		firstName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
	});

	type StaffSchema = z.infer<typeof channelSchema>;

	let staffFormErrors = $state.raw<Partial<Record<keyof StaffSchema, string[]>>>({});

	$effect(() => {
		formOk = !Object.keys(staffFormErrors).length;
	});

	const validate = () => {
		const parseResult = channelSchema.safeParse({
			lastName,
			firstName,
			email,
			isActive
		});
		if (!parseResult.success) {
			staffFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		staffFormErrors = {};
		return true;
	};

	const handleFormChange = (field: keyof StaffSchema) => {
		validate();
	};
</script>

<img
  src={avatar}
  alt="Avatar"
  class="w-12 h-12 rounded-full"
/>

<div class="flex gap-2 items-start">
	<Input
		label="Last name"
		bind:value={lastName}
		inputDebounceOption={{ onInput: () => handleFormChange('lastName') }}
		variant={staffFormErrors?.lastName?.length ? 'error' : 'info'}
		subText={staffFormErrors?.lastName?.length ? staffFormErrors.lastName[0] : ''}
		required
		{disabled}
		class="flex-1"
		onblur={validate}
	/>
  <Input
		label="First name"
		bind:value={firstName}
		inputDebounceOption={{ onInput: () => handleFormChange('firstName') }}
		variant={staffFormErrors?.firstName?.length ? 'error' : 'info'}
		subText={staffFormErrors?.firstName?.length ? staffFormErrors.firstName[0] : ''}
		required
		{disabled}
		class="flex-1"
		onblur={validate}
	/>
</div>
<Input
		label="Email"
		bind:value={email}
		class="flex-1 mt-3"
		required
		variant={staffFormErrors?.email?.length ? 'error' : 'info'}
		subText={staffFormErrors?.email?.length ? staffFormErrors.email[0] : ''}
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
	/>

<div class="mt-3 flex gap-3 items-center">
	<Checkbox label="Active" bind:checked={isActive} {disabled} size="sm" class="flex-1" />
</div>
