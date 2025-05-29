<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox, Input, TextArea } from '$lib/components/ui/Input';
	import { object, string, z } from 'zod';

	type Props = {
		firstName: string;
		lastName: string;
		email: string;
		isActive: boolean;
		note: string;
		disabled?: boolean;
		ok: boolean;
		isCreatePage?: boolean;
	};

	let {
		firstName = $bindable(''),
		lastName = $bindable(''),
		email = $bindable(''),
		isActive = $bindable(false),
		note = $bindable(''),
		disabled,
		ok = $bindable(false),
		isCreatePage = false,
	}: Props = $props();

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});

	let shouldDisable = $derived(!isCreatePage || disabled);
	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const customerSchema = object({
		firstName: string().nonempty(REQUIRED_ERROR),
		lastName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		note: string().nonempty(REQUIRED_ERROR),
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	const validate = () => {
		const result = customerSchema.safeParse({
			firstName,
			lastName,
			email,
			note,
		});
		if (!result.success) {
			customerFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
	<SectionHeader>Customer Information</SectionHeader>
	<div class="flex flex-row gap-3 items-start">
		<Input
			label="First Name"
			bind:value={firstName}
			required
			disabled={shouldDisable}
			class="flex-1"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.firstName?.length ? 'error' : 'info'}
			subText={customerFormErrors.firstName?.length ? customerFormErrors.firstName[0] : undefined}
		/>
		<Input
			label="Last Name"
			bind:value={lastName}
			required
			disabled={shouldDisable}
			class="flex-1"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.lastName?.length ? 'error' : 'info'}
			subText={customerFormErrors.lastName?.length ? customerFormErrors.lastName[0] : undefined}
		/>
	</div>
	<Input
		label="Email"
		bind:value={email}
		required
		disabled={shouldDisable}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.email?.length ? 'error' : 'info'}
		subText={customerFormErrors.email?.length ? customerFormErrors.email[0] : undefined}
	/>
	<Checkbox label="Active" bind:checked={isActive} />
	<TextArea
		bind:value={note}
		placeholder="Note"
		label="Note"
		required
		disabled={shouldDisable}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.note?.length ? 'error' : 'info'}
		subText={customerFormErrors.note?.length ? customerFormErrors.note[0] : undefined}
	/>
</div>
