<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { tranFunc } from '$i18n';
	import {
		VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION,
		VOUCHER_DELETE_MUTATION,
		VOUCHER_DETAIL_QUERY,
		VOUCHER_UPDATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import type { GeneralMetadataEditorRef } from '$lib/components/pages/settings/common';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ApplicationType from '$lib/components/pages/settings/vouchers/application-type.svelte';
	import DetailSkeleton from '$lib/components/pages/settings/vouchers/detail-skeleton.svelte';
	import DiscountType from '$lib/components/pages/settings/vouchers/discount-type.svelte';
	import EffectiveTime from '$lib/components/pages/settings/vouchers/effective-time.svelte';
	import Requirements from '$lib/components/pages/settings/vouchers/requirements.svelte';
	import Summary from '$lib/components/pages/settings/vouchers/summary.svelte';
	import UsageLimit from '$lib/components/pages/settings/vouchers/usage-limit.svelte';
	import VoucherCodes from '$lib/components/pages/settings/vouchers/voucher-codes.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import {
		type Query,
		type QueryVoucherArgs,
		type VoucherInput,
		VoucherTypeEnum,
		DiscountValueTypeEnum,
		type Mutation,
		type MutationVoucherDeleteArgs,
		type VoucherChannelListingInput,
		type VoucherChannelListing,
		type MutationVoucherUpdateArgs,
		type MutationVoucherChannelListingUpdateArgs,
		type VoucherChannelListingAddInput,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { CommonState } from '$lib/utils/common.svelte';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { pick } from 'es-toolkit';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { flattenError, string } from 'zod';

	const voucherQuery = operationStore<Pick<Query, 'voucher'>, QueryVoucherArgs>({
		query: VOUCHER_DETAIL_QUERY,
		variables: {
			id: page.params.id as string,
		},
		pause: !page.params.id,
		requestPolicy: 'cache-and-network',
	});

	let voucherInput = $state<VoucherInput>({
		name: '',
		startDate: '',
		endDate: '',
		usageLimit: 0,
		type: VoucherTypeEnum.EntireOrder,
		discountValueType: DiscountValueTypeEnum.Percentage,
		applyOncePerCustomer: false,
		onlyForStaff: false,
		applyOncePerOrder: false,
		singleUse: false,
		addCodes: [],
	});

	/** for updating channel listing */
	let voucherChannelListingInput = $state<VoucherChannelListingInput>({
		addChannels: [],
		removeChannels: [],
	});

	/** temporary state for UI */
	let activeChannelListings = $state<VoucherChannelListing[]>([]);
	let metaRef = $state<GeneralMetadataEditorRef>();
	let loading = $state(false);

	const NameSchema = string().nonempty($CommonState.FieldRequiredError);
	let nameErrors = $state<string[]>([]);
	let generalFormOk = $state<boolean[]>([true, true]);

	const validateName = () => {
		const result = NameSchema.safeParse(voucherInput.name);
		nameErrors = result.success ? [] : flattenError(result.error).formErrors;
		generalFormOk[0] = result.success;
	};

	onMount(() =>
		voucherQuery.subscribe((result) => {
			if (!result.data?.voucher) return;
			voucherInput = {
				...voucherInput,
				...pick(result.data.voucher, [
					'name',
					'startDate',
					'endDate',
					'usageLimit',
					'type',
					'discountValueType',
					'applyOncePerCustomer',
					'applyOncePerOrder',
					'onlyForStaff',
					'singleUse',
					'minCheckoutItemsQuantity',
				]),
			};

			activeChannelListings = result.data.voucher.channelListings || [];
		}),
	);

	const handleUpdateVoucher = async () => {
		const mainUpdate = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherUpdate'>,
			MutationVoucherUpdateArgs
		>(VOUCHER_UPDATE_MUTATION, {
			id: page.params.id!,
			input: voucherInput,
		}).toPromise();

		const channelListingUpdate = GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherChannelListingUpdate'>,
			MutationVoucherChannelListingUpdateArgs
		>(VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: page.params.id!,
			input: {
				...voucherChannelListingInput,
				addChannels: activeChannelListings.map<VoucherChannelListingAddInput>((item) => ({
					channelId: item.channel.id,
					discountValue: item.discountValue,
					minAmountSpent: item.minSpent?.amount,
				})),
			},
		}).toPromise();

		loading = true;
		const results = await Promise.all([mainUpdate, channelListingUpdate]);
		const resultKeys = ['voucherUpdate', 'voucherChannelListingUpdate'] as (keyof Mutation)[];
		const hasErr = results.some((res, idx) =>
			checkIfGraphqlResultHasError(res as any, resultKeys[idx]),
		);
		if (hasErr) {
			loading = false;
			return;
		}

		// update meta
		const isThereError = await metaRef?.handleUpdate();
		loading = false;
		if (isThereError) return;

		toast.success($CommonState.EditSuccess);
		voucherQuery.reexecute({
			variables: { id: page.params.id! },
		});
	};

	const handleDeleteVoucher = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $CommonState.ConfirmDelete,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'voucherDelete'>,
					MutationVoucherDeleteArgs
				>(VOUCHER_DELETE_MUTATION, { id: page.params.id! });
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'voucherDelete', $CommonState.DeleteSuccess))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_VOUCHERS());
			},
		});
	};
</script>

{#if $voucherQuery.fetching}
	<DetailSkeleton />
{:else if $voucherQuery.error}
	<Alert variant="error" bordered size="sm">{$voucherQuery.error.message}</Alert>
{:else if $voucherQuery.data?.voucher}
	{@const { id, metadata, privateMetadata, channelListings, used } = $voucherQuery.data.voucher}
	<div class="flex gap-2">
		<div class="w-7/10 space-y-2">
			<div class={SitenameCommonClassName}>
				<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
				<Input
					placeholder={$tranFunc('common.name')}
					label={$tranFunc('common.name')}
					required
					disabled={loading}
					bind:value={voucherInput.name}
					onblur={validateName}
					inputDebounceOption={{ onInput: validateName }}
					variant={nameErrors.length ? 'error' : 'info'}
					subText={nameErrors[0]}
				/>
			</div>
			<VoucherCodes
				voucherId={id}
				bind:addVoucherCodeStrings={voucherInput.addCodes!}
				disabled={loading}
			/>
			<DiscountType
				bind:discountType={voucherInput.discountValueType!}
				bind:voucherChannelListingInput
				bind:activeChannelListings
				existingChannelListings={channelListings || []}
				disabled={loading}
				bind:formOk={generalFormOk[1]}
			/>
			<ApplicationType
				bind:applicationType={voucherInput.type!}
				bind:applyOncePerOrder={voucherInput.applyOncePerOrder!}
				discountType={voucherInput.discountValueType!}
				disabled={loading}
				onAssignCatalogItems={handleUpdateVoucher}
			/>
			<Requirements
				bind:minimumQuantityOfItems={voucherInput.minCheckoutItemsQuantity!}
				bind:activeChannelListings
				disabled={loading}
			/>
			<UsageLimit
				bind:usageLimit={voucherInput.usageLimit!}
				bind:applyOncePerCustomer={voucherInput.applyOncePerCustomer!}
				bind:onlyForStaff={voucherInput.onlyForStaff!}
				bind:singleUse={voucherInput.singleUse!}
				voucherUsedTimes={used}
				disabled={loading}
			/>
			<EffectiveTime
				bind:startDate={voucherInput.startDate!}
				bind:endDate={voucherInput.endDate!}
				disabled={loading}
			/>
			<GeneralMetadataEditor
				objectId={id}
				{metadata}
				{privateMetadata}
				bind:this={metaRef}
				disabled={loading}
			/>
		</div>

		<div class="w-3/10">
			<Summary voucher={$voucherQuery.data.voucher} />
		</div>
	</div>

	<ActionBar
		onUpdateClick={handleUpdateVoucher}
		onDeleteClick={handleDeleteVoucher}
		disabled={loading}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_VOUCHERS()}
		disableUpdateButton={generalFormOk.some((item) => item === false)}
	/>
{/if}
