<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import { CHANNEL_DETAILS_QUERY_STORE, CHANNELS_QUERY } from '$lib/api/channels';
	import type {
		Channel,
		ChannelUpdateInput,
		CountryCode,
		Mutation,
		MutationChannelDeleteArgs,
		MutationChannelUpdateArgs,
		Query
	} from '$lib/gql/graphql';
	import { Input } from '$lib/components/ui/Input';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { afterNavigate, goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { Modal } from '$lib/components/ui/Modal';
	import { tranFunc } from '$i18n';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import { onMount } from 'svelte';
	import slugify from 'slugify';
	import ChannelDetailSkeleton from '$lib/components/pages/settings/config/channel-detail-skeleton.svelte';
	import ChannelShippingZones from '$lib/components/pages/settings/config/channel/channel-shipping-zones.svelte';
	import ChannelWarehouses from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';
	import { omit } from 'es-toolkit';

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		kind: 'query',
		query: CHANNEL_DETAILS_QUERY_STORE,
		variables: { slug: page.params.slug },
		requestPolicy: 'network-only'
	});

	const channelsQuery = operationStore<Pick<Query, 'channels'>>({
		kind: 'query',
		requestPolicy: 'network-only',
		query: CHANNELS_QUERY
	});

	let channelToReplaceId = $state<string>();
	let loading = $state(false);
	let openDeleteModal = $state(false);
	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const channelSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
		defaultCountry: string()
			.nonempty(REQUIRED_ERROR)
			.optional()
			.refine((val) => val !== undefined, REQUIRED_ERROR)
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});

	let channelValues = $state<ChannelUpdateInput & { currencyCode: string }>({
		name: '',
		slug: '',
		isActive: false,
		defaultCountry: undefined,
		addShippingZones: [],
		removeShippingZones: [],
		addWarehouses: [],
		removeWarehouses: [],
		currencyCode: ''
	});
	let oldChannel = $state<Channel>();

	let nothingChanged = $derived.by(() => {
		if (!oldChannel) return true;
		const shippingZonesChanged = (channelValues.addShippingZones?.length as number) > 0 || (channelValues.removeShippingZones?.length as number) > 0;
		const warehousesChanged = (channelValues.addWarehouses?.length as number) > 0 || (channelValues.removeWarehouses?.length as number) > 0;
		return (
			channelValues.name === oldChannel.name &&
			channelValues.slug === oldChannel.slug &&
			channelValues.isActive === oldChannel.isActive &&
			channelValues.defaultCountry === oldChannel.defaultCountry?.code &&
			!shippingZonesChanged &&
			!warehousesChanged
		);
	});

	const validate = () => {
		const parseResult = channelSchema.safeParse(channelValues);
		if (!parseResult.success) {
			channelFormErrors = parseResult.error.formErrors.fieldErrors;
			return false;
		}
		channelFormErrors = {};
		return true;
	};

	const delModalHeader = $derived(
		$tranFunc('settings.confirmDelChannel', { id: channelValues.name })
	);

	const handleFormChange = (field: keyof ChannelSchema) => {
		if (field === 'name' && typeof channelValues.name === 'string') {
			channelValues.slug = slugify(channelValues.name, { lower: true });
		}
		validate();
	};

	onMount(() => {
		const unsub = channelDetailQuery.subscribe((result) => {
			if (result.data?.channel) {
				oldChannel = result.data.channel;
				channelValues = {
					...channelValues,
					name: result.data.channel.name,
					slug: result.data.channel.slug,
					isActive: result.data.channel.isActive,
					defaultCountry: result.data.channel?.defaultCountry?.code as CountryCode,
					currencyCode: result.data.channel.currencyCode,
				};
			}
		});

		return unsub;
	});

	const handleDeleteChannel = async () => {
		const variable: MutationChannelDeleteArgs = {
			id: $channelDetailQuery.data?.channel?.id as string
		};
		if (channelToReplaceId) {
			variable.input = {
				channelId: channelToReplaceId
			};
		}

		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelDelete'>>(
			CHANNEL_DELETE_MUTATION,
			variable
		);

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelDelete')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel deleted successfully'
		});
		await goto(AppRoute.SETTINGS_CONFIGS_CHANNELS());
	};

	const handleUpdateChannel = async () => {
		if (!validate()) return;
		const newSlug = channelValues.slug;
		loading = true;
		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelUpdate'>,
			MutationChannelUpdateArgs
		>(CHANNEL_UPDATE_MUTATION, {
			id: $channelDetailQuery.data?.channel?.id as string,
			input: omit(channelValues, ['currencyCode'])
		});

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelUpdate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel updated successfully'
		});

		await goto(AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(newSlug as string), {
			replaceState: true
		});
	};

	afterNavigate(() => {
		const slug = page.params.slug;
		channelDetailQuery.reexecute({ variables: { slug } });
	});
</script>

{#if $channelDetailQuery.fetching}
	<ChannelDetailSkeleton />
{:else if $channelDetailQuery.error}
	<Alert variant="error" bordered>{$channelDetailQuery.error.message}</Alert>
{:else if $channelDetailQuery.data?.channel}
	{@const { channel } = $channelDetailQuery.data}
	{@const countryOptions =
		channel.countries?.map<SelectOption>((country) => ({
			value: country.code,
			label: country.country
		})) || []}
	{@const replaceChannelOptions =
		$channelsQuery.data?.channels?.reduce<SelectOption[]>((acc, cur) => {
			if (cur.id !== channel.id && cur.currencyCode === channel.currencyCode) {
				return acc.concat({
					value: cur.id,
					label: cur.name
				});
			}
			return acc;
		}, []) || []}
	<div class="h-full">
		<div class="flex flex-row gap-2">
			<!-- MARK: general information -->
			<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
				<Input
					label="Name"
					bind:value={channelValues.name}
					inputDebounceOption={{ onInput: () => handleFormChange('name') }}
					variant={channelFormErrors?.name?.length ? 'error' : 'info'}
					subText={channelFormErrors?.name?.length ? channelFormErrors.name[0] : ''}
					required
					disabled={loading}
				/>
				<div class="mt-3 flex gap-3">
					<Input
						label="Slug"
						bind:value={channelValues.slug}
						class="flex-1"
						required
						variant={channelFormErrors?.slug?.length ? 'error' : 'info'}
						subText={channelFormErrors?.slug?.length ? channelFormErrors.slug[0] : ''}
						inputDebounceOption={{ onInput: () => handleFormChange('slug') }}
						disabled={loading}
					/>
					<div class="flex flex-1 gap-2 py-2">
						<Checkbox
							label={channelValues.isActive ? 'Active' : 'Inactive'}
							bind:checked={channelValues.isActive}
							disabled={loading}
						/>
					</div>
				</div>

				<div class="mt-3 flex gap-3">
					<Input label="Currency" value={channelValues.currencyCode} disabled class="flex-1" />
					<Select
						label="Country"
						options={countryOptions}
						placeholder="Select a country"
						class="flex-1"
						bind:value={channelValues.defaultCountry as string}
						required
						variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
						subText={channelFormErrors?.defaultCountry?.length
							? channelFormErrors.defaultCountry[0]
							: ''}
						onchange={() => handleFormChange('defaultCountry')}
						disabled={loading}
					/>
				</div>
				<Modal
					open={openDeleteModal}
					header={delModalHeader}
					onOk={handleDeleteChannel}
					onCancel={() => (openDeleteModal = false)}
					onClose={() => (openDeleteModal = false)}
					closeOnOutsideClick
					size="sm"
					cancelText={$tranFunc('common.cancel')}
					okText={$tranFunc('btn.delete')}
				>
					<Select
						options={replaceChannelOptions}
						bind:value={channelToReplaceId}
						label="Please specify channel to replace"
						placeholder="Channel to replace"
					/>

					<Alert variant="info" size="sm" bordered class="mt-3">
						Specify a new channel to assign products to. The replace channel must have the same
						currency as deleting channel
					</Alert>
				</Modal>

				<div class="mt-3 flex flex-col">
					<Checkbox
						label="Allow unpaid orders"
						checked={channelValues.orderSettings?.allowUnpaidOrders}
						disabled={loading}
					/>
					<Checkbox
						label="Allow partial payments"
						checked={channelValues.orderSettings?.automaticallyConfirmAllNewOrders}
						disabled={loading}
					/>
				</div>
			</div>

			<!-- MARK: channel detail sidebar -->
			<div class="w-1/3">
				<ChannelShippingZones
					channelSlug={channel.slug}
					bind:addShippingZones={channelValues.addShippingZones as string[]}
					bind:removeShippingZones={channelValues.removeShippingZones as string[]}
					disabled={loading}
				/>
				<ChannelWarehouses
					channelSlug={channel.slug}
					bind:addWarehouses={channelValues.addWarehouses as string[]}
					bind:removeWarehouses={channelValues.removeWarehouses as string[]}
					disabled={loading}
				/>
			</div>
		</div>

		<!-- MARK: channel detail actions -->
		<div
			class="mt-5 sticky bottom-0 flex justify-between items-center bg-white p-2 border rounded-lg border-gray-200"
		>
			<Button color="red" disabled={loading} onclick={() => (openDeleteModal = true)}>Delete</Button
			>

			<div class="flex gap-2">
				<Button
					variant="light"
					color="gray"
					disabled={loading}
					onclick={() => goto(AppRoute.SETTINGS_CONFIGS_CHANNELS())}>Back</Button
				>
				<Button disabled={loading || nothingChanged} onclick={handleUpdateChannel}>Update</Button>
			</div>
		</div>
	</div>
{/if}
