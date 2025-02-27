<script lang="ts">
	import { tranFunc } from '$i18n';
	import { USER_UPDATE_MUTATION } from '$lib/api/account';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Input } from '$lib/components/ui/Input';
	import type { Mutation, MutationCustomerUpdateArgs, User } from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { object, string, z } from 'zod';

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const UserInfoSchema = object({
		firstName: string().min(1, { message: FIELD_REQUIRED }),
		lastName: string().min(1, { message: FIELD_REQUIRED }),
		email: string()
			.email({ message: $tranFunc('error.invalidEmail') })
			.min(1, { message: FIELD_REQUIRED })
	});
	type InfoProps = z.infer<typeof UserInfoSchema>;

	let userInfoInputs = $state<InfoProps>({
		firstName: '',
		lastName: '',
		email: ''
	});
	let userInfoFormErrors = $state.raw<Partial<Record<keyof InfoProps, string[]>>>({});
	let loading = $state(false);

	$effect(() => {
		if ($userStore) {
			userInfoInputs = {
				firstName: $userStore.firstName,
				lastName: $userStore.lastName,
				email: $userStore.email
			};
		}
	});

	let userInfoChanged = $derived.by(() => {
		return (
			userInfoInputs.firstName !== $userStore?.firstName ||
			userInfoInputs.lastName !== $userStore?.lastName ||
			userInfoInputs.email !== $userStore?.email
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
			Pick<Mutation, 'customerUpdate'>,
			MutationCustomerUpdateArgs
		>(USER_UPDATE_MUTATION, {
			input: { ...userInfoInputs },
			id: $userStore?.id
		}).toPromise();

		loading = false; //

		if (preHandleErrorOnGraphqlResult(result)) return;
		if (result.data?.customerUpdate?.errors.length) {
			toastStore.send({
				message: result.data.customerUpdate.errors[0].message as string,
				variant: 'error'
			});
			return;
		}
		toastStore.send({
			message: 'Update success',
			variant: 'success'
		});
		$userStore = {
			...$userStore,
			firstName: userInfoInputs.firstName,
			lastName: userInfoInputs.lastName,
			email: userInfoInputs.email
		} as User;
	};
</script>

<div class="flex items-start gap-2 w-full tablet:flex-wrap flex-nowrap">
	<Input
		placeholder="first name"
		label="First name"
		class="w-1/2 tablet:w-full"
		required
		bind:value={userInfoInputs.firstName}
		variant={userInfoFormErrors.firstName?.length ? 'error' : 'info'}
		subText={userInfoFormErrors.firstName?.length ? userInfoFormErrors.firstName[0] : ''}
		onblur={userValidate}
		disabled={loading}
	/>
	<Input
		placeholder="last name"
		label="Last name"
		class="w-1/2 tablet:w-full"
		required
		bind:value={userInfoInputs.lastName}
		variant={userInfoFormErrors.lastName?.length ? 'error' : 'info'}
		subText={userInfoFormErrors.lastName?.length ? userInfoFormErrors.lastName[0] : ''}
		onblur={userValidate}
		disabled={loading}
	/>
</div>

<Input
	placeholder="email"
	class="mt-2"
	label="Email"
	required
	startIcon={Email}
	bind:value={userInfoInputs.email}
	variant={userInfoFormErrors.email?.length ? 'error' : 'info'}
	subText={userInfoFormErrors.email?.length ? userInfoFormErrors.email[0] : ''}
	onblur={userValidate}
	disabled={loading}
/>

<div class="text-right mt-4">
	<Button onclick={handleSubmit} {loading} disabled={loading || !userInfoChanged}>Update</Button>
</div>
