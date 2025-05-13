<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Checkbox, Input, TextArea } from '$lib/components/ui/Input';
	import { object, string, z } from 'zod';

	type Props = {
		firstName: string;
		lastName: string;
		email: string;
		isActive: boolean;
		note: string;
		disabled?: boolean;
	};

	let {
		firstName = $bindable(''),
		lastName = $bindable(''),
		email = $bindable(''),
		isActive = $bindable(false),
		note = $bindable(''),
		disabled
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const DESCRIPTION_MAX_LENGTH = 300;

	const customerSchema = object({
		firstName: string().nonempty(REQUIRED_ERROR),
		lastName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		note: string()
			.nonempty(REQUIRED_ERROR)
			.max(DESCRIPTION_MAX_LENGTH, `Note must be at most ${DESCRIPTION_MAX_LENGTH} characters long`)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;

	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	const validate = () => {
		const result = customerSchema.safeParse({
			firstName,
			lastName,
			email
		});
		if (!result.success) {
			customerFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};
</script>

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-3">
	<Input
		label="First Name"
		bind:value={firstName}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.firstName?.length ? 'error' : 'info'}
		subText={customerFormErrors.firstName?.length ? customerFormErrors.firstName[0] : undefined}
	/>

	<Input
		label="Last Name"
		bind:value={lastName}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.lastName?.length ? 'error' : 'info'}
		subText={customerFormErrors.lastName?.length ? customerFormErrors.lastName[0] : undefined}
	/>

	<Input
		label="Email"
		bind:value={email}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.email?.length ? 'error' : 'info'}
		subText={customerFormErrors.email?.length ? customerFormErrors.email[0] : undefined}
	/>

	<Checkbox label="Is active" bind:checked={isActive}/>

	<TextArea
		bind:value={note}
		placeholder="Note"
		label="Note"
		required
		{disabled}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.note?.length ? 'error' : 'info'}
		subText={customerFormErrors.note?.length
			? customerFormErrors.note[0]
			: `${note?.length || 0} / ${DESCRIPTION_MAX_LENGTH}`}
	/>
</div>
