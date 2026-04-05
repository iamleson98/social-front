<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { BackendHttpClient } from '$lib/utils/api';
	import { SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import z from 'zod';

	type Props = {
		name: string;
		email: string;
		representor_id: string;
		phone: string;
		description?: string;
		disabled?: boolean;
		formOk: boolean;
	};

	let {
		name = $bindable(''),
		email = $bindable(''),
		representor_id = $bindable(''),
		phone = $bindable(''),
		description = $bindable(''),
		disabled,
		formOk = $bindable(true),
	}: Props = $props();

	let userSearchQuery = $state('');
	let options = $state<SelectOption[]>([]);

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
			.startsWith('+84', 'Phone number must start with +84')
			.nonempty('Phone number is required'),
		description: z.string().optional(),
	});

	const SchemaHandler = createSchemaHandler(
		FormSchema,
		() => ({ name, email, representor_id, phone, description }),
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

	onMount(() => {
		UsersQuery.mutate('');
	});
</script>

<div class={SitenameCommonClassName}>
	<SectionHeader>General Information</SectionHeader>

	<div class="grid grid-cols-2 gap-2">
		<Input
			label="Name"
			required
			bind:value={name}
			variant={$SchemaHandler.name?.length ? 'error' : 'info'}
			subText={$SchemaHandler.name?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			{disabled}
		/>
		<Input
			label="Email"
			type="email"
			required
			bind:value={email}
			variant={$SchemaHandler.email?.length ? 'error' : 'info'}
			subText={$SchemaHandler.email?.[0]}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			{disabled}
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
			bind:value={representor_id}
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
			{disabled}
		/>
		<Input
			type="tel"
			label="Phone Number"
			required
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			placeholder="+84 ..."
			bind:value={phone}
			variant={$SchemaHandler.phone?.length ? 'error' : 'info'}
			subText={$SchemaHandler.phone?.[0]}
			{disabled}
		/>
	</div>
	<TextArea
		label="Description"
		bind:value={description}
		onblur={SchemaHandler.validate}
		inputDebounceOption={{ onInput: SchemaHandler.validate }}
		{disabled}
	/>
</div>
