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
		formOk?: boolean;
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
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		isActive: boolean()
	});

	type StaffSchema = z.infer<typeof channelSchema>;

	let staffFormErrors = $state.raw<Partial<Record<keyof StaffSchema, string[]>>>({});

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
		formOk = true;
		return true;
	};
</script>

<div class="h-full w-full rounded-lg bg-white border border-gray-200 p-4">
	<div class="rounded-full overflow-hidden h-20 w-20 flex items-center justify-center bg-blue-600">
		{#if avatar}
			<img src={avatar} alt={avatar} />
		{:else}
			<span class="text-white text-2xl font-bold">
				{`${firstName[0] || email[0]}${lastName[0] || email[1]}`.toUpperCase()}
			</span>
		{/if}
	</div>

	<div class="flex gap-2 items-start mt-5">
		<Input
			label="Last name"
			bind:value={lastName}
			inputDebounceOption={{ onInput: validate }}
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
			inputDebounceOption={{ onInput: validate }}
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
		<Checkbox label="Active" bind:checked={isActive} size="sm" class="flex-1" />
	</div>
</div>
