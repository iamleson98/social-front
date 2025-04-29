<script lang="ts">
	import { Input } from '$lib/components/ui/Input';
	import { Button } from '$lib/components/ui';
	import { tranFunc } from '$i18n';
	import { Select } from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import slugify from 'slugify';
	import ChannelShippingZones from '$lib/components/pages/settings/config/channel/channel-shipping-zones.svelte';
	import ChannelWarehouses from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';
	import { CHANNEL_CREATE_MUTATION } from '$lib/api/admin/channels';
	import { CountryCode, type Mutation, type MutationChannelCreateArgs } from '$lib/gql/graphql';
	import { toastStore } from '$lib/stores/ui/toast';
	import { preHandleErrorOnGraphqlResult } from '$lib/utils/utils';
	import { GRAPHQL_CLIENT } from '$lib/api/client';
	import { getCountryName } from '$lib/utils/address';
	import { CHANNELS } from '$lib/utils/channels';

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const channelSchema = object({
		name: string().nonempty(REQUIRED_ERROR),
		slug: string().nonempty(REQUIRED_ERROR),
		isActive: boolean(),
		currencyCode: string(),
		defaultCountry: z
			.array(
				object({
					label: string(),
					value: string()
				})
			)
			.nonempty(REQUIRED_ERROR)
	});

	type ChannelSchema = z.infer<typeof channelSchema>;

	let channelFormErrors = $state.raw<Partial<Record<keyof ChannelSchema, string[]>>>({});
	let loading = $state(false);

	const countryOptions = Object.values(CountryCode).map((code) => ({
		value: code,
		label: getCountryName(code)
	}));

	const currencyOptions = Array.from(new Set(CHANNELS.map((chan) => chan.currency))).map((code) => ({
		value: code,
		label: code
	}));

	let channelValues = $state<ChannelSchema>({
		name: '',
		slug: '',
		isActive: false,
		currencyCode: '',
		defaultCountry: [countryOptions[0]]
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

	const handleNameChange = () => {
		channelValues.slug = slugify(channelValues.name, { lower: true });
	};

	const handleAddChannel = async () => {
		if (!validate()) return;

		const result = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'channelCreate'>,
			MutationChannelCreateArgs
		>(CHANNEL_CREATE_MUTATION, {
			input: {
				...channelValues,
				defaultCountry: channelValues.defaultCountry[0].value as CountryCode
			}
		});

		if (preHandleErrorOnGraphqlResult(result, 'channelCreate')) return;
		toastStore.send({
			variant: 'success',
			message: 'Channel created successfully'
		});
	};
</script>

<div class="relative">
	<div class="flex flex-row gap-2">
		<!-- MARK: general information -->
		<div class="w-2/3 rounded-lg bg-white border border-gray-200 p-4 h-fit">
			<Input
				label="Name"
				bind:value={channelValues.name}
				inputDebounceOption={{ onInput: handleNameChange }}
				required
				variant={channelFormErrors?.name?.length ? 'error' : 'info'}
				subText={channelFormErrors?.name?.length ? channelFormErrors.name[0] : ''}
			/>
			<div class="mt-3 flex gap-3">
				<Input
					label="Slug"
					bind:value={channelValues.slug}
					class="flex-1"
					required
					variant={channelFormErrors?.slug?.length ? 'error' : 'info'}
					subText={channelFormErrors?.slug?.length ? channelFormErrors.slug[0] : ''}
				/>
				<div class="flex flex-1 gap-2 py-2">
					<Checkbox
						label={channelValues.isActive ? 'Active' : 'Inactive'}
						bind:checked={channelValues.isActive}
					/>
				</div>
			</div>

			<div class="mt-3 flex gap-3">
				<Select
					label="Currency"
					placeholder="Select currency"
					class="flex-1"
					bind:value={channelValues.currencyCode}
					options={currencyOptions}
					required
					variant={channelFormErrors?.currencyCode?.length ? 'error' : 'info'}
					subText={channelFormErrors?.currencyCode?.length ? channelFormErrors.currencyCode[0] : ''}
				/>
				<Select
					label="Default Country"
					placeholder="Select country"
					class="flex-1"
					bind:value={channelValues.defaultCountry[0].value}
					options={countryOptions}
					required
					variant={channelFormErrors?.defaultCountry?.length ? 'error' : 'info'}
					subText={channelFormErrors?.defaultCountry?.length
						? channelFormErrors.defaultCountry[0]
						: ''}
				/>
			</div>
		</div>
		<div class="w-1/3">
			<ChannelShippingZones
				channelSlug={'channel.slug'}
				addShippingZones={[]}
				removeShippingZones={[]}
				disabled={loading}
			/>
			<ChannelWarehouses
				channelSlug={'channel.slug'}
				addWarehouses={[]}
				removeWarehouses={[]}
				disabled={loading}
			/>
		</div>
	</div>
	<!-- MARK: channel detail actions -->
	<div class="mt-5 flex justify-between items-center">
		<Button onclick={handleAddChannel} disabled={loading}>Add Channel</Button>
	</div>
</div>
