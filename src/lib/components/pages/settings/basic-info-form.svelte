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
		type User
	} from '$lib/gql/graphql';
	import { ME_PAGE_USER_STORE } from '$lib/stores/app/me';
	import { setUserStoreValue } from '$lib/stores/auth';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { object, string, z } from 'zod';

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const UserInfoSchema = object({
		firstName: string().min(1, { message: FIELD_REQUIRED }),
		lastName: string().min(1, { message: FIELD_REQUIRED }),
		languageCode: string().min(1, { message: FIELD_REQUIRED })
	});
	type InfoProps = z.infer<typeof UserInfoSchema>;

	let userInfoInputs = $state<InfoProps>({
		firstName: '',
		lastName: '',
		languageCode: ''
	});
	let userInfoFormErrors = $state.raw<Partial<Record<keyof InfoProps, string[]>>>({});
	let loading = $state(false);

	$effect(() => {
		if ($ME_PAGE_USER_STORE) {
			userInfoInputs = {
				firstName: $ME_PAGE_USER_STORE.firstName,
				lastName: $ME_PAGE_USER_STORE.lastName,
				languageCode: $ME_PAGE_USER_STORE.languageCode
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

	const userValidate = () => {
		const userInfoParse = UserInfoSchema.safeParse(userInfoInputs);
		if (!userInfoParse.success) {
			userInfoFormErrors = userInfoParse.error.flatten().fieldErrors;
		}

		return userInfoParse.success;
	};

	const handleSubmit = async () => {
		if (!userValidate()) return;

		loading = true; //

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'accountUpdate'>,
			MutationAccountUpdateArgs
		>(ACCOUNT_UPDATE_MUTATION, {
			input: { ...userInfoInputs } as AccountInput
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result, 'accountUpdate')) return;
		toastStore.send({
			message: 'Update success',
			variant: 'success'
		});
		$ME_PAGE_USER_STORE = {
			...$ME_PAGE_USER_STORE,
			...userInfoInputs
		} as User;

		// in case user update display language , we need to update it for the whole UI also
		setUserStoreValue($ME_PAGE_USER_STORE);
	};
</script>

<div class="rounded-lg bg-white border border-gray-200 p-4">
	<Label size="lg" label={$tranFunc('settings.basicInfo')} />

	<div class="flex items-start mt-3 gap-2 w-full tablet:flex-wrap flex-nowrap">
		<Input
			placeholder={$tranFunc('common.firstName')}
			label={$tranFunc('common.firstName')}
			class="w-1/2 tablet:w-full"
			required
			bind:value={userInfoInputs.firstName}
			variant={userInfoFormErrors.firstName?.length ? 'error' : 'info'}
			subText={userInfoFormErrors.firstName?.length ? userInfoFormErrors.firstName[0] : ''}
			onblur={userValidate}
			disabled={loading}
		/>
		<Input
			placeholder={$tranFunc('common.lastName')}
			label={$tranFunc('common.lastName')}
			class="w-1/2 tablet:w-full"
			required
			bind:value={userInfoInputs.lastName}
			variant={userInfoFormErrors.lastName?.length ? 'error' : 'info'}
			subText={userInfoFormErrors.lastName?.length ? userInfoFormErrors.lastName[0] : ''}
			onblur={userValidate}
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
			label: lang.name
		}))}
		bind:value={userInfoInputs.languageCode}
		variant={userInfoFormErrors.languageCode?.length ? 'error' : 'info'}
		subText={userInfoFormErrors.languageCode?.length ? userInfoFormErrors.languageCode[0] : ''}
		onblur={userValidate}
		disabled={loading}
	/>

	<div class="text-right mt-4">
		<Button onclick={handleSubmit} {loading} disabled={loading || !userInfoChanged}
			>{$tranFunc('btn.update')}</Button
		>
	</div>
</div>
