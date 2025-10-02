<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea, Toggle } from '$lib/components/ui/Input';
	import { PermissionEnum } from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkUserHasPermissions, SitenameCommonClassName } from '$lib/utils/utils';
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

	// only user can modify their own information. shop employees don't have permission to update customer
	let shouldDisable = $derived(!isCreatePage || disabled);

	// user manager can only activate/deactivate customer
	const CurrentUserCanUpdateCustomer = $derived(
		!$UserStoreManager
			? false
			: checkUserHasPermissions($UserStoreManager, PermissionEnum.ManageUsers),
	);
	const customerSchema = object({
		firstName: string().nonempty($CommonState.FieldRequiredError),
		lastName: string().nonempty($CommonState.FieldRequiredError),
		email: string().nonempty($CommonState.FieldRequiredError).email($CommonState.InvalidEmail),
		note: string().nonempty($CommonState.FieldRequiredError),
	});

	type CustomerSchema = z.infer<typeof customerSchema>;
	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	$effect(() => {
		ok = !Object.keys(customerFormErrors).length;
	});

	const validate = () => {
		const result = customerSchema.safeParse({
			firstName,
			lastName,
			email,
			note,
		});
		customerFormErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$tranFunc('customer.info')}</div>
		<Toggle
			bind:checked={isActive}
			label={$tranFunc('staff.active')}
			disabled={!CurrentUserCanUpdateCustomer || disabled}
		/>
	</SectionHeader>
	<div class="flex flex-row gap-3 items-start">
		<Input
			label={$tranFunc('common.firstName')}
			placeholder={$tranFunc('common.firstName')}
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
			label={$tranFunc('common.lastName')}
			placeholder={$tranFunc('common.lastName')}
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
		label={$tranFunc('common.email')}
		placeholder={$tranFunc('common.email')}
		bind:value={email}
		required
		disabled={shouldDisable}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.email?.length ? 'error' : 'info'}
		subText={customerFormErrors.email?.length ? customerFormErrors.email[0] : undefined}
	/>
	<TextArea
		bind:value={note}
		placeholder={$tranFunc('giftcard.form.note')}
		label={$tranFunc('giftcard.form.note')}
		required
		disabled={shouldDisable}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.note?.length ? 'error' : 'info'}
		subText={customerFormErrors.note?.length ? customerFormErrors.note[0] : undefined}
	/>
</div>
