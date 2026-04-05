<script lang="ts">
	import { goto } from '$app/navigation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { ActionBar } from '$lib/components/pages/settings/common';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { BookingTransportBrand } from '$lib/types/booking';
	import { AppRoute } from '$lib/utils';
	import { BackendHttpClient } from '$lib/utils/api';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import z from 'zod';

	let userSearchQuery = $state('');
	let options = $state<SelectOption[]>([]);
	let formOk = $state(false);

	const FormSchema = z.object({
		name: z.string().min(1, 'Name is required'),
		email: z.email('Invalid email address'),
		representor_id: z
			.string()
			.min(1, 'Representor is required')
			.nonempty('Representor is required'),
		phone: z
			.string()
			.min(1, 'Phone number is required')
			.startsWith('+84', 'Phone number must start with +84'),
		description: z.string().optional(),
	});

	let brandForm = $state<BookingTransportBrand>({
		id: '',
		createat: 0,
		updateat: 0,
		name: '',
		email: '',
		representor_id: '',
		phone: '',
	});

	const SchemaHandler = createSchemaHandler(
		FormSchema,
		() => brandForm,
		(ok) => (formOk = ok),
	);

	const UsersQuery = createMutation(() => ({
		mutationKey: ['users'],
		mutationFn: async (term: string) =>
			await BackendHttpClient.searchUsers({
				term,
				limit: 40,
			}),
		onSuccess: (data) => {
			options = data.map((user) => ({
				label: `@${user.username}`,
				value: user.id,
			}));
		},
		onError: (err) => {
			toast.error('Failed to load users: ' + err.message);
		},
	}));

	const CreateBrandMutation = createMutation(() => ({
		mutationKey: ['createTransportBrand'],
		mutationFn: async (newBrand: BookingTransportBrand) =>
			await BackendHttpClient.createBookingTransportBrand(newBrand),
		onSuccess: async (brand) => {
			toast.success('Transport brand created successfully');
			await goto(AppRoute.BookingTransportBrandDetails(brand.id));
		},
		onError: (err) => {
			toast.error('Failed to create transport brand: ' + err.message);
		},
	}));

	const handleCreate = async () => {
		if (!SchemaHandler.validate()) return;
		await CreateBrandMutation.mutateAsync(brandForm);
	};

	onMount(() => {
		UsersQuery.mutate('');
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>Add Transport Brand</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<Input
			label="Name"
			required
			bind:value={brandForm.name}
			variant={$SchemaHandler.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler.name?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
		/>
		<Input
			label="Email"
			type="email"
			required
			bind:value={brandForm.email}
			variant={$SchemaHandler.email?.length ? 'error' : 'info'}
			subText={$SchemaHandler.email?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
		/>
	</div>
	<div class="grid grid-cols-2 gap-2">
		<Select
			label="Representor"
			required
			{options}
			size="md"
			variant={$SchemaHandler.representor_id?.length ? 'error' : 'info'}
			subText={$SchemaHandler.representor_id?.[0]}
			showLoadingMore={UsersQuery.isPending}
			bind:value={brandForm.representor_id}
			onblur={SchemaHandler.validate}
			onchange={SchemaHandler.validate}
			inputDebounceOption={{
				debounceTime: 888,
				onInput: async (evt) => {
					const value = (evt.target as HTMLInputElement).value.trim();
					if (value !== userSearchQuery) {
						userSearchQuery = value;
						await UsersQuery.mutateAsync(userSearchQuery);
					}
					SchemaHandler.validate();
				},
			}}
		/>
		<Input
			type="tel"
			label="Phone Number"
			required
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			placeholder="+84 ..."
			bind:value={brandForm.phone}
			variant={$SchemaHandler.phone?.length ? 'error' : 'info'}
			subText={$SchemaHandler.phone?.[0]}
		/>
	</div>
	<TextArea
		label="Description"
		bind:value={brandForm.description}
		onblur={SchemaHandler.validate}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
	/>
</div>

<ActionBar
	disabled={CreateBrandMutation.isPending}
	onAddClick={handleCreate}
	backButtonUrl={AppRoute.BookingTransportBrands()}
	disableBackButton={CreateBrandMutation.isPending}
	disableCreateButton={!formOk}
/>
