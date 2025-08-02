<script lang="ts">
	import { goto } from '$app/navigation';
	import { tranFunc } from '$i18n';
	import {
		VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION,
		VOUCHER_CREATE_MUTATION,
	} from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ApplicationType from '$lib/components/pages/settings/vouchers/application-type.svelte';
	import DiscountType from '$lib/components/pages/settings/vouchers/discount-type.svelte';
	import EffectiveTime from '$lib/components/pages/settings/vouchers/effective-time.svelte';
	import Requirements from '$lib/components/pages/settings/vouchers/requirements.svelte';
	import Summary from '$lib/components/pages/settings/vouchers/summary.svelte';
	import UsageLimit from '$lib/components/pages/settings/vouchers/usage-limit.svelte';
	import VoucherCodes from '$lib/components/pages/settings/vouchers/voucher-codes.svelte';
	import { Input } from '$lib/components/ui/Input';
	import {
		type VoucherInput,
		VoucherTypeEnum,
		DiscountValueTypeEnum,
		// type VoucherChannelListingInput,
		type VoucherChannelListing,
		type Mutation,
		type MutationVoucherCreateArgs,
		type MutationVoucherChannelListingUpdateArgs,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError, SitenameCommonClassName } from '$lib/utils/utils';
	import { string } from 'zod';

	let voucherInput = $state<VoucherInput>({
		name: '',
		code: '',
		startDate: '',
		endDate: '',
		usageLimit: 0,
		type: VoucherTypeEnum.EntireOrder,
		discountValueType: DiscountValueTypeEnum.Percentage,
		applyOncePerCustomer: false,
		onlyForStaff: false,
		applyOncePerOrder: false,
		singleUse: false,
		categories: [],
		products: [],
		collections: [],
		variants: [],
		addCodes: [],
	});

	let createdVoucherId = $state<string>('');

	/** temporary state for UI */
	let activeChannelListings = $state<VoucherChannelListing[]>([]);
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	const NameSchema = string().nonempty($tranFunc('helpText.fieldRequired'));
	let nameErrors = $state<string[]>([]);

	const validateName = () => {
		const result = NameSchema.safeParse(voucherInput.name);
		nameErrors = result.success ? [] : result.error.formErrors.formErrors;
		return result.success;
	};

	const handleCreateVoucher = async () => {
		if (!validateName()) return;

		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherCreate'>,
			MutationVoucherCreateArgs
		>(VOUCHER_CREATE_MUTATION, {
			input: voucherInput,
		});

		if (checkIfGraphqlResultHasError(result, 'voucherCreate')) return;

		createdVoucherId = result.data?.voucherCreate?.voucher?.id!;
		performUpdateMetadata = true;

		const channelListingUpdateResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'voucherChannelListingUpdate'>,
			MutationVoucherChannelListingUpdateArgs
		>(VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: createdVoucherId,
			input: {
				addChannels: activeChannelListings.map((item) => ({
					channelId: item.channel.id,
					minAmountSpent: item.minSpent?.amount,
					discountValue: item.discountValue,
				})),
			},
		});

		loading = false;

		if (
			checkIfGraphqlResultHasError(
				channelListingUpdateResult,
				'voucherChannelListingUpdate',
				$tranFunc('common.createSuccess'),
			)
		)
			return;

		await goto(AppRoute.SETTINGS_CONFIGS_VOUCHER_DETAIL(createdVoucherId!));
	};
</script>

<div class="flex gap-2">
	<div class="w-7/10 space-y-2">
		<div class={SitenameCommonClassName}>
			<SectionHeader>{$tranFunc('common.generalInfo')}</SectionHeader>
			<Input
				placeholder={$tranFunc('common.name')}
				label={$tranFunc('common.name')}
				required
				bind:value={voucherInput.name}
				onblur={validateName}
				inputDebounceOption={{ onInput: validateName }}
				variant={nameErrors.length ? 'error' : 'info'}
				subText={nameErrors[0]}
				disabled={loading}
			/>
		</div>
		<VoucherCodes bind:addVoucherCodeStrings={voucherInput.addCodes!} />
		<DiscountType
			bind:discountType={voucherInput.discountValueType!}
			bind:activeChannelListings
			disabled={loading}
		/>
		<ApplicationType
			bind:applicationType={voucherInput.type!}
			bind:applyOncePerOrder={voucherInput.applyOncePerOrder!}
			bind:newCategories={voucherInput.categories!}
			bind:newCollections={voucherInput.collections!}
			bind:newProducts={voucherInput.products!}
			bind:newVariants={voucherInput.variants!}
			discountType={voucherInput.discountValueType!}
			disabled={loading}
			isCreatePage
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
			voucherUsedTimes={0}
			disabled={loading}
		/>
		<EffectiveTime
			disabled={loading}
			bind:startDate={voucherInput.startDate!}
			bind:endDate={voucherInput.endDate!}
		/>
		<GeneralMetadataEditor
			objectId={createdVoucherId}
			metadata={[]}
			privateMetadata={[]}
			bind:performUpdateMetadata
			disabled={loading}
		/>
	</div>

	<div class="w-3/10">
		<Summary />
	</div>
</div>

<ActionBar
	onAddClick={handleCreateVoucher}
	disabled={loading}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_VOUCHERS()}
/>
