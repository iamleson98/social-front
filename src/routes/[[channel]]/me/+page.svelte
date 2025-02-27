<script lang="ts">
	import { tranFunc } from '$i18n';
	import { PASSWORD_UPDATE_MUTATION, USER_UPDATE_MUTATION } from '$lib/api/account';
	import { operationStore, type OperationResultStore } from '$lib/api/operation';
	import { Email } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Checkbox, Input, PasswordInput } from '$lib/components/ui/Input';
	import type {
		Mutation,
		MutationCustomerUpdateArgs,
		MutationPasswordChangeArgs,
	} from '$lib/gql/graphql';
	import { userStore } from '$lib/stores/auth';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { pick } from 'es-toolkit';
	import { slide } from 'svelte/transition';
	import { object, string, z } from 'zod';

	const FIELD_REQUIRED = $tranFunc('helpText.fieldRequired');

	const UserInfoSchema = object({
		firstName: string().min(1, { message: FIELD_REQUIRED }),
		lastName: string().min(1, { message: FIELD_REQUIRED }),
		email: string()
			.email({ message: $tranFunc('error.invalidEmail') })
			.min(1, { message: FIELD_REQUIRED })
	});

	const PasswordSchema = object({
		oldPassword: string().min(1, { message: FIELD_REQUIRED }),
		newPassword: string().min(1, { message: FIELD_REQUIRED }),
		confirmPassword: string().min(1, { message: FIELD_REQUIRED })
	}).refine((data) => data.newPassword === data.confirmPassword, {
		message: $tranFunc('error.passwordsNotMatch'),
		path: ['confirmPassword']
	});

	type InfoProps = z.infer<typeof UserInfoSchema>;
	type PasswordProps = z.infer<typeof PasswordSchema>;

	let updatePasswordCheck = $state(false);
	let userInfoInputs = $state<InfoProps>({
		firstName: '',
		lastName: '',
		email: ''
	});
	let userInfoFormErrors = $state.raw<Partial<Record<keyof InfoProps, string[]>>>({});

	$effect(() => {
		if ($userStore) {
			userInfoInputs = {
				firstName: $userStore.firstName,
				lastName: $userStore.lastName,
				email: $userStore.email
			};
		}
	});

	let passwordInputs = $state<PasswordProps>({
		oldPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	let passwordFormErrors = $state.raw<Partial<Record<keyof PasswordProps, string[]>>>({});
	let userInfoChanged = $derived.by(() => {
		return (
			userInfoInputs.firstName !== $userStore?.firstName ||
			userInfoInputs.lastName !== $userStore?.lastName ||
			userInfoInputs.email !== $userStore?.email
		);
	});
	let passwordChanged = $derived.by(() => {
		return (
			updatePasswordCheck &&
			passwordInputs.oldPassword !== '' &&
			passwordInputs.newPassword !== '' &&
			passwordInputs.confirmPassword !== '' &&
			passwordInputs.newPassword === passwordInputs.confirmPassword
		);
	});
	let customerUpdateStore =
		$state<OperationResultStore<Pick<Mutation, 'customerUpdate'>, MutationCustomerUpdateArgs>>();
	let passwordUpdateStore =
		$state<OperationResultStore<Pick<Mutation, 'passwordChange'>, MutationPasswordChangeArgs>>();

	$effect(() => {
		let unsub1: () => void, unsub2: () => void;
		if (customerUpdateStore) {
			unsub1 = customerUpdateStore.subscribe((result) => {
        customerUpdateStore = undefined;
				if (preHandleErrorOnGraphqlResult(result)) return;
				if (result.data?.customerUpdate?.errors.length) {
					toastStore.send({
						variant: 'error',
						message: result.data?.customerUpdate?.errors[0].message as string
					});
					return;
				}
				toastStore.send({
					variant: 'success',
					message: 'Customer updated successfully'
				});
				// $userStore = {
				// 	...$userStore,
				// 	firstName: userInfoInputs.firstName,
				// 	lastName: userInfoInputs.lastName,
				// 	email: userInfoInputs.email
				// } as User;
			});
		}

		if (passwordUpdateStore) {
			unsub2 = passwordUpdateStore.subscribe((result) => {
        passwordUpdateStore = undefined;
				if (preHandleErrorOnGraphqlResult(result)) return;
				if (result.data?.passwordChange?.errors.length) {
					toastStore.send({
						variant: 'error',
						message: result.data?.passwordChange?.errors[0].message as string
					});
					return;
				}
				toastStore.send({
					variant: 'success',
					message: 'Password updated successfully'
				});
			});
		}

		return () => {
			unsub1?.();
			unsub2?.();
		};
	});

	const userValidate = () => {
		const userInfoParse = UserInfoSchema.safeParse(userInfoInputs);
		if (!userInfoParse.success) {
			userInfoFormErrors = userInfoParse.error.flatten().fieldErrors;
		}

		return userInfoParse.success;
	};

	const passwordValidate = () => {
		if (!updatePasswordCheck) {
			passwordFormErrors = {};
			return true;
		}

		const passwordInfoParse = PasswordSchema.safeParse(passwordInputs);
		if (!passwordInfoParse.success) {
			passwordFormErrors = passwordInfoParse.error.flatten().fieldErrors;
		}

		return passwordInfoParse.success;
	};

	const handleSubmit = () => {
		if (!userInfoChanged && !passwordChanged) return;
		if (!userValidate() || !passwordValidate()) return;

		if (userInfoChanged)
			customerUpdateStore = operationStore({
				kind: 'mutation',
				query: USER_UPDATE_MUTATION,
				requestPolicy: 'network-only',
				variables: {
					input: { ...userInfoInputs },
					id: $userStore?.id
				}
			});

		if (updatePasswordCheck && passwordChanged)
			passwordUpdateStore = operationStore({
				kind: 'mutation',
				query: PASSWORD_UPDATE_MUTATION,
				requestPolicy: 'network-only',
				variables: pick(passwordInputs, ['oldPassword', 'newPassword'])
			});
	};
</script>

<div>
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
	/>

	<br />

	<div class="mt-2">
		<Checkbox size="sm" label="Update Password" bind:checked={updatePasswordCheck} />

		{#if updatePasswordCheck}
			<div in:slide>
				<PasswordInput
					size="sm"
					class="mt-2"
					required
					placeholder="old password"
					label="Old password"
					bind:value={passwordInputs.oldPassword}
					showAction
					variant={passwordFormErrors.oldPassword?.length ? 'error' : 'info'}
					subText={passwordFormErrors.oldPassword?.length ? passwordFormErrors.oldPassword[0] : ''}
					onblur={passwordValidate}
				/>
				<PasswordInput
					size="sm"
					class="mt-2"
					required
					placeholder="new password"
					label="New password"
					bind:value={passwordInputs.newPassword}
					showAction
					variant={passwordFormErrors.newPassword?.length ? 'error' : 'info'}
					subText={passwordFormErrors.newPassword?.length ? passwordFormErrors.newPassword[0] : ''}
					onblur={passwordValidate}
				/>
				<PasswordInput
					size="sm"
					class="mt-2"
					required
					placeholder="confirm new password"
					label="Confirm new password"
					bind:value={passwordInputs.confirmPassword}
					variant={passwordFormErrors.confirmPassword?.length ? 'error' : 'info'}
					onblur={passwordValidate}
					subText={passwordFormErrors.confirmPassword?.length
						? passwordFormErrors.confirmPassword[0]
						: ''}
				/>
			</div>
		{/if}
	</div>

	<div class="mt-10 text-right">
		<Button
			disabled={!userInfoChanged && !passwordChanged}
			onclick={handleSubmit}
			loading={$customerUpdateStore?.fetching || $passwordUpdateStore?.fetching}>Update</Button
		>
	</div>
</div>
