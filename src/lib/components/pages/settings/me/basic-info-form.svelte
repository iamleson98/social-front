<script lang="ts">
	import { SUPPORTED_LANGUAGES, tranFunc } from '$i18n';
	import { ACCOUNT_UPDATE_MUTATION } from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Button } from '$lib/components/ui';
	import { Input, Label } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import {
		type AccountInput,
		type Mutation,
		type MutationAccountUpdateArgs,
		type User,
	} from '$lib/gql/graphql';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { UserStoreManager } from '$lib/stores/auth';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { object, string, z } from 'zod';

	const UserInfoSchema = object({
		firstName: string().nonempty($CommonState.FieldRequiredError),
		lastName: string().nonempty($CommonState.FieldRequiredError),
		languageCode: string()
			.nonempty($CommonState.FieldRequiredError)
			.optional()
			.refine((val) => val !== undefined, $CommonState.FieldRequiredError),
	});
	type InfoProps = z.infer<typeof UserInfoSchema>;

	let userInfoInputs = $state<InfoProps>({
		firstName: '',
		lastName: '',
		languageCode: '',
	});
	const SchemaHandler = createSchemaHandler(UserInfoSchema, () => userInfoInputs);

	let loading = $state(false);

	$effect(() => {
		if ($ME_PAGE_USER_STORE) {
			userInfoInputs = {
				firstName: $ME_PAGE_USER_STORE.firstName,
				lastName: $ME_PAGE_USER_STORE.lastName,
				languageCode: $ME_PAGE_USER_STORE.languageCode,
			};
		}
	});

	let userInfoChanged = $derived.by(() => {
		return (
			userInfoInputs.firstName !== $ME_PAGE_USER_STORE?.firstName ||
			userInfoInputs.lastName !== $ME_PAGE_USER_STORE?.lastName ||
			userInfoInputs.languageCode !== $ME_PAGE_USER_STORE?.languageCode
		);
	});

	const handleSubmit = async () => {
		if (!SchemaHandler.validate()) return;

		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountUpdate'>,
			MutationAccountUpdateArgs
		>(ACCOUNT_UPDATE_MUTATION, {
			input: userInfoInputs as AccountInput,
		});

		loading = false; //

		if (checkIfGraphqlResultHasError(result, 'accountUpdate', $tranFunc('settings.accountUpdated')))
			return;

		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			...userInfoInputs,
		} as User;

		// in case user update display language , we need to update it for the whole UI also
		UserStoreManager.setValue($ME_PAGE_USER_STORE);
	};
</script>

<div class={SitenameCommonClassName}>
	<Label size="lg" label={$tranFunc('settings.basicInfo')} />

	<div class="flex items-start mt-3 gap-2 w-full tablet:flex-wrap flex-nowrap">
		<Input
			placeholder={$tranFunc('common.firstName')}
			label={$tranFunc('common.firstName')}
			class="w-1/2 tablet:w-full"
			required
			bind:value={userInfoInputs.firstName}
			variant={$SchemaHandler.firstName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.firstName?.length ? $SchemaHandler.firstName[0] : ''}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			disabled={loading}
		/>
		<Input
			placeholder={$tranFunc('common.lastName')}
			label={$tranFunc('common.lastName')}
			class="w-1/2 tablet:w-full"
			required
			bind:value={userInfoInputs.lastName}
			variant={$SchemaHandler.lastName?.length ? 'error' : 'info'}
			subText={$SchemaHandler.lastName?.length ? $SchemaHandler.lastName[0] : ''}
			onblur={SchemaHandler.validate}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			disabled={loading}
		/>
	</div>

	<Select
		placeholder={$tranFunc('footer.language')}
		class="mt-2"
		required
		label={$tranFunc('footer.language')}
		options={SUPPORTED_LANGUAGES.map((lang) => ({
			value: lang.code,
			label: lang.name,
		}))}
		bind:value={userInfoInputs.languageCode}
		variant={$SchemaHandler.languageCode?.length ? 'error' : 'info'}
		subText={$SchemaHandler.languageCode?.length ? $SchemaHandler.languageCode[0] : ''}
		onchange={SchemaHandler.validate}
		onblur={SchemaHandler.validate}
		disabled={loading}
	/>

	<div class="text-right mt-4">
		<Button onclick={handleSubmit} {loading} disabled={loading || !userInfoChanged}
			>{$tranFunc('btn.update')}</Button
		>
	</div>
</div>
