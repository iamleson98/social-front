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
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import ApplicationType from '$lib/components/pages/settings/vouchers/application-type.svelte';
	import DiscountType from '$lib/components/pages/settings/vouchers/discount-type.svelte';
	import EffectiveTime from '$lib/components/pages/settings/vouchers/effective-time.svelte';
	import Requirements from '$lib/components/pages/settings/vouchers/requirements.svelte';
	import Skeleton from '$lib/components/pages/settings/vouchers/skeleton.svelte';
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
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { string } from 'zod';

	const voucherQuery = operationStore<Pick<Query, 'voucher'>, QueryVoucherArgs>({
		kind: 'query',
		query: VOUCHER_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		pause: !page.params.id,
	});

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

	onMount(() =>
		voucherQuery.subscribe((result) => {
			if (!result.data?.voucher) return;

			const {
				name,
				code,
				startDate,
				endDate,
				usageLimit,
				type,
				discountValueType,
				applyOncePerOrder,
				applyOncePerCustomer,
				onlyForStaff,
				singleUse,
				channelListings,
			} = result.data.voucher;

			voucherInput = {
				name,
				code,
				startDate,
				endDate,
				usageLimit,
				type,
				discountValueType,
				applyOncePerOrder,
				applyOncePerCustomer,
				onlyForStaff,
				singleUse,
			};

			activeChannelListings = channelListings || [];
		}),
	);

	const handleUpdateVoucher = async () => {
		performUpdateMetadata = true;

		const mainUpdate = GRAPHQL_CLIENT.mutation(VOUCHER_UPDATE_MUTATION, {
			id: page.params.id,
			input: voucherInput,
		}).toPromise();

		const channelListingUpdate = GRAPHQL_CLIENT.mutation(VOUCHER_CHANNEL_LISTING_UPDATE_MUTATION, {
			id: page.params.id,
			input: voucherChannelListingInput,
		}).toPromise();

		const resultKeys = ['voucherUpdate', 'voucherChannelListingUpdate'] as (keyof Mutation)[];

		loading = true;
		const results = await Promise.all([mainUpdate, channelListingUpdate]);
		loading = false;

		let hasErr = false;
		results.forEach(
			(item, idx) => (hasErr ||= checkIfGraphqlResultHasError(item as any, resultKeys[idx])),
		);

		if (hasErr) return;
	};

	const handleDeleteVoucher = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure to delete the voucher ${page.params.id}?`,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'voucherDelete'>,
					MutationVoucherDeleteArgs
				>(VOUCHER_DELETE_MUTATION, { id: page.params.id });
				loading = false;

				if (checkIfGraphqlResultHasError(result, 'voucherDelete', 'Voucher deleted successfully'))
					return;

				await goto(AppRoute.SETTINGS_CONFIGS_VOUCHERS());
			},
		});
	};
</script>

{#if $voucherQuery.fetching}
	<Skeleton />
{:else if $voucherQuery.error}
	<Alert variant="error" bordered size="sm">{$voucherQuery.error.message}</Alert>
{:else if $voucherQuery.data?.voucher}
	{@const {
		id,
		metadata,
		privateMetadata,
		channelListings,
		categories,
		collections,
		used,
		products,
		variants,
	} = $voucherQuery.data.voucher}
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
			<VoucherCodes voucherId={id} bind:addVoucherCodeStrings={voucherInput.addCodes!} />
			<DiscountType
				bind:discountType={voucherInput.discountValueType!}
				bind:applyOncePerCustomer={voucherInput.applyOncePerCustomer!}
				bind:onlyForStaff={voucherInput.onlyForStaff!}
				bind:singleUse={voucherInput.singleUse!}
				bind:usageLimit={voucherInput.usageLimit!}
				bind:voucherChannelListingInput
				bind:activeChannelListings
				existingChannelListings={channelListings || []}
			/>
			<ApplicationType
				bind:applicationType={voucherInput.type!}
				bind:applyOncePerOrder={voucherInput.applyOncePerOrder!}
				bind:newCategories={voucherInput.categories!}
				bind:newCollections={voucherInput.collections!}
				bind:newProducts={voucherInput.products!}
				bind:newVariants={voucherInput.variants!}
				discountType={voucherInput.discountValueType!}
				existingCategoriesCount={categories?.totalCount!}
				existingCollectionsCount={collections?.totalCount!}
				existingProductsCount={products?.totalCount!}
				existingVariantsCount={variants?.totalCount!}
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
				voucherUsedTimes={used}
			/>
			<EffectiveTime
				bind:startDate={voucherInput.startDate!}
				bind:endDate={voucherInput.endDate!}
			/>
			<GeneralMetadataEditor
				objectId={id}
				{metadata}
				{privateMetadata}
				bind:performUpdateMetadata
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
		disableUpdateButton={loading}
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_VOUCHERS()}
	/>
{/if}
