<script lang="ts">
	import { tranFunc } from '$i18n';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ApplicationType from '$lib/components/pages/settings/config/vouchers/application-type.svelte';
	import DiscountType from '$lib/components/pages/settings/config/vouchers/discount-type.svelte';
	import EffectiveTime from '$lib/components/pages/settings/config/vouchers/effective-time.svelte';
	import Requirements from '$lib/components/pages/settings/config/vouchers/requirements.svelte';
	import Summary from '$lib/components/pages/settings/config/vouchers/summary.svelte';
	import UsageLimit from '$lib/components/pages/settings/config/vouchers/usage-limit.svelte';
	import VoucherCodes from '$lib/components/pages/settings/config/vouchers/voucher-codes.svelte';
	import { Input } from '$lib/components/ui/Input';
	import {
		type VoucherInput,
		VoucherTypeEnum,
		DiscountValueTypeEnum,
		type VoucherChannelListingInput,
		type VoucherChannelListing,
	} from '$lib/gql/graphql';
	import { AppRoute } from '$lib/utils';
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

	/** for updating channel listing */
	let voucherChannelListingInput = $state<VoucherChannelListingInput>({
		addChannels: [],
		removeChannels: [],
	});

	let createdVoucherId = $state<string>();

	/** temporary state for UI */
	let activeChannelListings = $state<VoucherChannelListing[]>([]);
	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	const NameSchema = string().nonempty($tranFunc('helpText.fieldRequired'));
	let nameErrors = $state<string[]>([]);

	const validateName = () => {
		const result = NameSchema.safeParse(voucherInput.name);
		nameErrors = result.success ? [] : result.error.formErrors.formErrors;
	};

	const handleCreateVoucher = async () => {};
</script>

<div class="flex gap-2">
	<div class="w-7/10 space-y-2">
		<div class="rounded-lg p-3 border border-gray-200 bg-white">
			<SectionHeader>General information</SectionHeader>
			<Input
				placeholder="Voucher name"
				label="Voucher name"
				required
				bind:value={voucherInput.name}
				onblur={validateName}
				inputDebounceOption={{ onInput: validateName }}
				variant={nameErrors.length ? 'error' : 'info'}
				subText={nameErrors[0]}
			/>
		</div>
		<VoucherCodes bind:addVoucherCodeStrings={voucherInput.addCodes!} />
		<DiscountType
			bind:discountType={voucherInput.discountValueType!}
			bind:applyOncePerCustomer={voucherInput.applyOncePerCustomer!}
			bind:onlyForStaff={voucherInput.onlyForStaff!}
			bind:singleUse={voucherInput.singleUse!}
			bind:usageLimit={voucherInput.usageLimit!}
			bind:voucherChannelListingInput
			bind:activeChannelListings
			existingChannelListings={[]}
		/>
		<ApplicationType
			bind:applicationType={voucherInput.type!}
			bind:applyOncePerOrder={voucherInput.applyOncePerOrder!}
			bind:newCategories={voucherInput.categories!}
			bind:newCollections={voucherInput.collections!}
			bind:newProducts={voucherInput.products!}
			bind:newVariants={voucherInput.variants!}
			discountType={voucherInput.discountValueType!}
			existingCategoriesCount={0}
			existingCollectionsCount={0}
			existingProductsCount={0}
			existingVariantsCount={0}
		/>
		<Requirements
			bind:minimumQuantityOfItems={voucherInput.minCheckoutItemsQuantity!}
			bind:activeChannelListings
		/>
		<UsageLimit
			bind:usageLimit={voucherInput.usageLimit!}
			bind:applyOncePerCustomer={voucherInput.applyOncePerCustomer!}
			bind:onlyForStaff={voucherInput.onlyForStaff!}
			bind:singleUse={voucherInput.singleUse!}
			voucherUsedTimes={0}
		/>
		<EffectiveTime bind:startDate={voucherInput.startDate!} bind:endDate={voucherInput.endDate!} />
		<GeneralMetadataEditor
			objectId={createdVoucherId as string}
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
	disableUpdateButton={loading}
	backButtonUrl={AppRoute.SETTINGS_CONFIGS_VOUCHERS()}
/>
