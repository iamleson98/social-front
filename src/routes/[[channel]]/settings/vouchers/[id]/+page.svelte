<script lang="ts">
	import { page } from '$app/state';
	import { VOUCHER_DETAIL_QUERY } from '$lib/api/admin/discount';
	import { operationStore } from '$lib/api/operation';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import GeneralMetadataEditor from '$lib/components/pages/settings/common/general-metadata-editor.svelte';
	import DiscountType from '$lib/components/pages/settings/config/vouchers/discount-type.svelte';
	import VoucherCodes from '$lib/components/pages/settings/config/vouchers/voucher-codes.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { SelectSkeleton } from '$lib/components/ui/select';
	import {
		type VoucherUpdate,
		type Query,
		type QueryVoucherArgs,
		type MutationVoucherUpdateArgs,
		type VoucherInput,
		VoucherTypeEnum,
		DiscountValueTypeEnum,
	} from '$lib/gql/graphql';
	import { onMount } from 'svelte';

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
	});

	let performUpdateMetadata = $state(false);
	let loading = $state(false);

	onMount(() =>
		voucherQuery.subscribe((result) => {
			if (!result.data?.voucher) return;

			const { name, code, startDate, endDate, usageLimit, type, discountValueType } =
				result.data.voucher;

			voucherInput = {
				name,
				code,
				startDate,
				endDate,
				usageLimit,
				type,
				discountValueType,
			};
		}),
	);

	const handleUpdateVoucher = async () => {
		performUpdateMetadata = true;
	};

	const handleDeleteVoucher = async () => {};
</script>

{#if $voucherQuery.fetching}
	<SelectSkeleton label />
{:else if $voucherQuery.error}
	<Alert variant="error" bordered size="sm">{$voucherQuery.error.message}</Alert>
{:else if $voucherQuery.data?.voucher}
	{@const { id, metadata, privateMetadata } = $voucherQuery.data.voucher}
	<div class="flex gap-2">
		<div class="w-7/10 space-y-2">
			<div class="rounded-lg p-3 border border-gray-200 bg-white">
				<SectionHeader>General information</SectionHeader>
				<Input
					size="sm"
					placeholder="Voucher name"
					label="Voucher name"
					required
					bind:value={voucherInput.name}
				/>
			</div>

			<VoucherCodes voucherId={id} />

			<DiscountType bind:discountType={voucherInput.type!} />

			<GeneralMetadataEditor
				objectId={id}
				{metadata}
				{privateMetadata}
				bind:performUpdateMetadata
				disabled={loading}
			/>
		</div>

		<div class="w-3/10"></div>
	</div>

	<ActionBar
		onUpdateClick={handleUpdateVoucher}
		onDeleteClick={handleDeleteVoucher}
		disableUpdateButton={loading}
	/>
{/if}
