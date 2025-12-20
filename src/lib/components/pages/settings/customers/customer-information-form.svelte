<script lang="ts">
	import { T } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea, Toggle } from '$lib/components/ui/Input';
	import { PermissionEnum } from '$lib/gql/graphql';
	import { UserStoreManager } from '$lib/stores/auth';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkUserHasPermissions, SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { object, string, email as emailSchema } from 'zod';

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
		email: emailSchema($CommonState.InvalidEmail).nonempty($CommonState.FieldRequiredError),
		note: string().nonempty($CommonState.FieldRequiredError),
	});

	const SchemaHandler = createSchemaHandler(
		customerSchema,
		() => ({
			firstName,
			lastName,
			email,
			note,
		}),
		(success) => (ok = success),
	);
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>
		<div>{$T('customer.info')}</div>
		<Toggle
			bind:checked={isActive}
			label={$T('staff.active')}
			disabled={!CurrentUserCanUpdateCustomer || disabled}
		/>
	</SectionHeader>
	<div class="flex flex-row gap-3 items-start">
		<Input
			label={$T('common.firstName')}
			placeholder={$T('common.firstName')}
			bind:value={firstName}
			required
			disabled={shouldDisable}
			class="flex-1"
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			variant={$SchemaHandler.firstName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.firstName?.length ? $SchemaHandler.firstName[0] : undefined}
		/>
		<Input
			label={$T('common.lastName')}
			placeholder={$T('common.lastName')}
			bind:value={lastName}
			required
			disabled={shouldDisable}
			class="flex-1"
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			variant={$SchemaHandler.lastName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.lastName?.length ? $SchemaHandler.lastName[0] : undefined}
		/>
	</div>
	<Input
		label={$T('common.email')}
		placeholder={$T('common.email')}
		bind:value={email}
		required
		disabled={shouldDisable}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.email?.length ? 'error' : 'info'}
		subText={$SchemaHandler.email?.length ? $SchemaHandler.email[0] : undefined}
	/>
	<TextArea
		bind:value={note}
		placeholder={$T('giftcard.form.note')}
		label={$T('giftcard.form.note')}
		required
		disabled={shouldDisable}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.note?.length ? 'error' : 'info'}
		subText={$SchemaHandler.note?.length ? $SchemaHandler.note[0] : undefined}
	/>
</div>
