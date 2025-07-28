<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input } from '$lib/components/ui/Input';
	import { object, string, z } from 'zod';
	import AddressForm from '../../checkout/address-form.svelte';
	import { tranFunc } from '$i18n';
	import type { Address } from '$lib/gql/graphql';
	import { page } from '$app/state';
	import { noop } from 'es-toolkit';

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

	const RequiredErr = $tranFunc('helpText.fieldRequired');

	const WarehouseSchema = object({
		name: string().nonempty(RequiredErr),
		email: string().nonempty(RequiredErr),
		slug: string().nonempty(RequiredErr),
	});

	type WarehouseProps = z.infer<typeof WarehouseSchema>;

	let warehouseErrors = $state<Partial<Record<keyof WarehouseProps, string[]>>>({});

	const validate = () => {
		const result = WarehouseSchema.safeParse({ email, name, slug });
		warehouseErrors = result.success ? {} : result.error.formErrors.fieldErrors;
		return result.success;
	};

	$effect(() => {
		formOk = !Object.keys(warehouseErrors).length;
	});
</script>

<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2">
	<SectionHeader>General information</SectionHeader>
	<Input
		label="Warehouse name"
		placeholder="Warehouse name"
		bind:value={name}
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={warehouseErrors.name?.length ? 'error' : 'info'}
		subText={warehouseErrors.name?.[0]}
	/>
	<Input
		label="Warehouse slug"
		required
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		placeholder="Warehouse slug"
		bind:value={slug}
		variant={warehouseErrors.slug?.length ? 'error' : 'info'}
		subText={warehouseErrors.slug?.[0]}
	/>
	<Input
		label="Warehouse email"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		placeholder="Warehouse email"
		bind:value={email}
		variant={warehouseErrors.email?.length ? 'error' : 'info'}
		subText={warehouseErrors.email?.[0]}
	/>

	<SectionHeader>Address information</SectionHeader>
	<AddressForm
		defaultValue={address}
		channelSlug={isCreatePage ? '' : page.params.channel!}
		onCancel={noop}
		onSubmit={noop}
		updatingCheckoutAddresses={disabled}
	/>
</div>
