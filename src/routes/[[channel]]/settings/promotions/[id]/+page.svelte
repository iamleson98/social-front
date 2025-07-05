<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PROMOTION_DELETE_MUTATION, PROMOTION_DETAIL_QUERY } from '$lib/api/admin/discount';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import { operationStore } from '$lib/api/operation';
	import { EditorJSComponent } from '$lib/components/common/editorjs';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import ActionBar from '$lib/components/pages/settings/common/action-bar.svelte';
	import Rules from '$lib/components/pages/settings/config/promotions/rules.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import SelectSkeleton from '$lib/components/ui/select/select-skeleton.svelte';
	import {
		PromotionTypeEnum,
		type Mutation,
		type MutationPromotionDeleteArgs,
		type PromotionUpdateInput,
		type Query,
		type QueryPromotionArgs,
	} from '$lib/gql/graphql';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { checkIfGraphqlResultHasError } from '$lib/utils/utils';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	type Props = {
		isCreatePage?: boolean;
	};

	let { isCreatePage = false }: Props = $props();

	const promotionStore = operationStore<Pick<Query, 'promotion'>, QueryPromotionArgs>({
		kind: 'query',
		query: PROMOTION_DETAIL_QUERY,
		variables: {
			id: page.params.id,
		},
		requestPolicy: 'cache-and-network',
		pause: !page.params.id,
	});

	let promotionInput = $state<PromotionUpdateInput>({});
	let loading = $state(false);
	let promotionType = $state<PromotionTypeEnum>();

	let discountTypeOptions = Object.values(PromotionTypeEnum).map<SelectOption>((value) => ({
		value,
		label: value.toLowerCase(),
	}));

	onMount(() =>
		promotionStore.subscribe((result) => {
			if (!result.data?.promotion) return;

			const { name, description, startDate, endDate, type } = result.data.promotion;

			promotionInput = {
				name,
				description,
				startDate,
				endDate,
			};
			promotionType = type ?? undefined;
		}),
	);

	const handleUpdate = async () => {};

	const handleDelete = async () => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure deleting the promotion ${page.params.id}?`,
			onOk: async () => {
				loading = true;
				const result = await GRAPHQL_CLIENT.mutation<
					Pick<Mutation, 'promotionDelete'>,
					MutationPromotionDeleteArgs
				>(PROMOTION_DELETE_MUTATION, {
					id: page.params.id,
				});
				loading = false;

				if (
					!checkIfGraphqlResultHasError(
						result,
						'promotionDelete',
						'Promotion deleted successfully!',
					)
				)
					await goto(AppRoute.SETTINGS_CONFIGS_PROMOTIONS());
			},
		});
	};
</script>

{#if $promotionStore.fetching}
	<SelectSkeleton label />
{:else if $promotionStore.error}
	<Alert size="sm" variant="error" bordered>{$promotionStore.error.message}</Alert>
{:else if $promotionStore.data?.promotion}
	{@const { rules } = $promotionStore.data.promotion}
	<div class="rounded-lg bg-white border border-gray-200 p-3 space-y-2 mb-2">
		<SectionHeader>General information</SectionHeader>

		<div class="flex gap-2 items-start">
			<Select
				options={discountTypeOptions}
				label="Discount type"
				required
				class="flex-1/3"
				size="md"
				bind:value={promotionType}
				disabled={!isCreatePage || loading}
			/>
			<Input
				placeholder="Promotion name"
				label="Promotion name"
				required
				class="flex-2/3"
				size="md"
				bind:value={promotionInput.name}
				disabled={loading}
			/>
		</div>

		<EditorJSComponent
			label="Promotion description"
			required
			placeholder="Promotion description"
			bind:value={promotionInput.description}
			disabled={loading}
		/>

		<div class="flex items-start gap-2">
			<EaseDatePicker
				label="Start date"
				placeholder="Start date"
				required
				class="flex-1"
				value={{ date: promotionInput.startDate }}
				format={RFC3339TimeFormat}
				disabled={loading}
				onchange={(value) =>
					(promotionInput.startDate = dayjs(value.start).format(RFC3339TimeFormat))}
			/>
			<EaseDatePicker
				label="End date"
				placeholder="End date"
				class="flex-1"
				value={{ date: promotionInput.endDate }}
				format={RFC3339TimeFormat}
				disabled={loading}
				onchange={(value) =>
					(promotionInput.endDate = dayjs(value.start).format(RFC3339TimeFormat))}
			/>
		</div>
	</div>

	<Rules rules={rules || []} />

	<ActionBar
		backButtonUrl={AppRoute.SETTINGS_CONFIGS_PROMOTIONS()}
		onDeleteClick={handleDelete}
		onUpdateClick={handleUpdate}
		disabled={loading}
	/>
{/if}
