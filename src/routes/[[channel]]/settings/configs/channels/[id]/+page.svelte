<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import type { Mutation, MutationChannelDeleteArgs, Query } from '$lib/gql/graphql';
	import Input from '$lib/components/ui/Input/input.svelte';
	import { Button } from '$lib/components/ui';
	import { toastStore } from '$lib/stores/ui/toast';
	import { AppRoute } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { Modal } from '$lib/components/ui/Modal';
	import { tranFunc } from '$i18n';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Alert } from '$lib/components/ui/Alert';
	import {
		CHANNEL_DETAILS_BY_ID,
		CHANNELS_QUERY
	} from '$lib/api/channels';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import ChannelDetailRightSidebar from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';
	import { onMount } from 'svelte';
	import slugify from 'slugify';
	import ChannelDetailSkeleton from '$lib/components/pages/settings/config/channel-detail-skeleton.svelte';
	import ChannelShippingZones from '$lib/components/pages/settings/config/channel/channel-shipping-zones.svelte';

	const channelDetailQuery = operationStore<Pick<Query, 'channel'>>({
		kind: 'query',
		query: CHANNEL_DETAILS_BY_ID,
		variables: { id: page.params.id },
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
		currencyCode: string(),
		defaultCountry: string().nonempty(REQUIRED_ERROR)
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});

	let channelValues = $state<ChannelSchema>({
		name: '',
		slug: '',
		isActive: false,
		currencyCode: '',
		defaultCountry: ''
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

	const handleNameChange = () => {
		channelValues.slug = slugify(channelValues.name, { lower: true });
	};

	onMount(() => {
		const unsub = channelDetailQuery.subscribe((result) => {
			if (result.data?.channel) {
				channelValues = {
					name: result.data.channel.name,
					slug: result.data.channel.slug,
					isActive: result.data.channel.isActive,
					currencyCode: result.data.channel.currencyCode,
					defaultCountry: result.data.channel.defaultCountry.code
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
		const oldSlug = page.params.slug;
		const newSlug = channelValues.slug;
		loading = true;

		const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'channelUpdate'>>(
			CHANNEL_UPDATE_MUTATION,
			{
				id: $channelDetailQuery.data?.channel?.id,
				input: {
					name: channelValues.name,
					slug: channelValues.slug,
					isActive: channelValues.isActive
				}
			}
		);

		loading = false;

		if (preHandleErrorOnGraphqlResult(result, 'channelUpdate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel updated successfully'
		});

		if (oldSlug != newSlug) {
			await goto(AppRoute.SETTINGS_CONFIGS_CHANNEL_DETAILS(newSlug), {
				replaceState: true
			});
		}
	};
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
	<div class="relative">
		<div class="flex flex-row gap-2">
			<!-- MARK: general information -->
			<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
				<Input
					label="Name"
					bind:value={channelValues.name}
					inputDebounceOption={{ onInput: handleNameChange }}
				/>
				<div class="mt-3 flex gap-3">
					<Input label="Slug" bind:value={channelValues.slug} class="flex-1" />
					<div class="flex flex-1 gap-2 py-2">
						<Checkbox
							label={channelValues.isActive ? 'Active' : 'Inactive'}
							bind:checked={channelValues.isActive}
						/>
					</div>
				</div>

				<div class="mt-3 flex gap-3">
					<Input label="Currency" bind:value={channelValues.currencyCode} disabled class="flex-1" />
					<Select
						label="Country"
						options={countryOptions}
						placeholder="Select a country"
						class="flex-1"
						bind:value={channelValues.defaultCountry}
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
			</div>

			<!-- MARK: channel detail sidebar -->
			<div class="w-1/3">
				<ChannelShippingZones
					channelSlug={channel.slug}
					addShippingZones={[]}
					removeShippingZones={[]}
				/>
				<ChannelDetailRightSidebar {channel} />
			</div>
		</div>

		<!-- MARK: channel detail actions -->
		<div class="mt-5 flex justify-between items-center">
			<Button variant="light" color="red" {loading} onclick={() => (openDeleteModal = true)}>
				Delete
			</Button>

			<div class="space-x-2 absolute bottom-0 right-0 mt-5 flex justify-end">
				<Button variant="light" color="gray" {loading} href={AppRoute.SETTINGS_CONFIGS_CHANNELS()}
					>Back</Button
				>
				<Button onclick={handleUpdateChannel} {loading}>Update</Button>
			</div>
		</div>
	</div>
{/if}
