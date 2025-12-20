<script lang="ts">
	import { page } from '$app/state';
	import { T } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import type { Address } from '$lib/gql/graphql';
	import { CommonState } from '$lib/utils/common.svelte';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import AddressForm from '../../checkout/address-form.svelte';
	import { noop } from 'es-toolkit';
	import { object, string } from 'zod';

	type Props = {
		name: string;
		email: string;
		slug: string;
		address?: Address;
		isCreatePage?: boolean;
		disabled?: boolean;
		formOk: boolean;
	};

	let {
		name = $bindable(),
		slug = $bindable(),
		email = $bindable(),
		address,
		isCreatePage = false,
		disabled = false,
		formOk = $bindable(),
	}: Props = $props();

	const WarehouseSchema = object({
		name: string().nonempty($CommonState.FieldRequiredError),
		email: string().nonempty($CommonState.FieldRequiredError),
		slug: string().nonempty($CommonState.FieldRequiredError),
	});
	const SchemaHandler = createSchemaHandler(
		WarehouseSchema,
		() => ({
			name,
			email,
			slug,
		}),
		(ok) => (formOk = ok),
	);
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>{$T('common.generalInfo')}</SectionHeader>
	<Input
		label={$T('common.name')}
		bind:value={name}
		required
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		variant={$SchemaHandler.name?.length ? 'error' : 'info'}
		subText={$SchemaHandler.name?.[0]}
	/>
	<Input
		label={$T('common.slug')}
		required
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		bind:value={slug}
		variant={$SchemaHandler.slug?.length ? 'error' : 'info'}
		subText={$SchemaHandler.slug?.[0]}
	/>
	<Input
		label={$T('common.email')}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		onblur={SchemaHandler.validate}
		bind:value={email}
		variant={$SchemaHandler.email?.length ? 'error' : 'info'}
		subText={$SchemaHandler.email?.[0]}
	/>

	<SectionHeader>{$T('warehouse.addrInfo')}</SectionHeader>
	<AddressForm
		defaultValue={address}
		channelSlug={isCreatePage ? '' : page.params.channel!}
		onCancel={noop}
		onSubmit={noop}
		updatingCheckoutAddresses={disabled}
	/>
</div>
