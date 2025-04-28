<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { CHANNEL_DELETE_MUTATION, CHANNEL_UPDATE_MUTATION } from '$lib/api/admin/channels';
	import type { Mutation, MutationChannelDeleteArgs, Query } from '$lib/gql/graphql';
	import { Input } from '$lib/components/ui/Input';
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
	import { CHANNEL_DETAILS_BY_ID, CHANNELS_QUERY } from '$lib/api/channels';
	import { Checkbox } from '$lib/components/ui/Input';
	import { boolean, object, string, z } from 'zod';
	import ChannelDetailRightSidebar from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';
	import { onMount } from 'svelte';
	import slugify from 'slugify';
  import ChannelShippingZones from '$lib/components/pages/settings/config/channel/channel-shipping-zones.svelte';
	import ChannelDetailSkeleton from '$lib/components/pages/settings/config/channel-detail-skeleton.svelte';
	import ChannelWarehouses from '$lib/components/pages/settings/config/channel/channel-warehouses.svelte';

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

	const handleNameChange = () => {
		channelValues.slug = slugify(channelValues.name, { lower: true });
	};

  const handleAddChannel = () => {
    if(!validate) return;
  }
</script>

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
        <Input label="Currency" bind:value={channelValues.currencyCode} class="flex-1" />
        <Select
          label="Country"
          placeholder="Select a country"
          class="flex-1"
          bind:value={channelValues.defaultCountry}
        />
      </div>
    </div>
    <div class="w-1/3">
      <ChannelShippingZones
        channelSlug={"channel.slug"}
        addShippingZones={[]}
        removeShippingZones={[]}
      />
      <ChannelWarehouses channelSlug={"channel.slug"} addWarehouses={[]} removeWarehouses={[]} />
    </div>
  </div>
    <!-- MARK: channel detail actions -->
    <div class="mt-5 flex justify-between items-center">
      <Button> Add Channel </Button>
    </div>
  
</div>
