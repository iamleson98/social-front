<script lang="ts">
	import ChannelSelect from '$lib/components/common/channel-select/channel-select.svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Plus, Trash } from '$lib/components/icons';
	import { Button } from '$lib/components/ui/Button';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import type { CountryDisplay } from '$lib/gql/graphql';
	import { READ_ONLY_SHOP_STORE } from '$lib/stores/shop';

	type Props = {
		name: string;
		description: string;
		disabled?: boolean;
		countries: CountryDisplay[];
	};

	let { name = $bindable(), description = $bindable(), disabled, countries }: Props = $props();

	let countryCodes = $state(countries.map((country) => country.code));

	const CountriesOptions = $derived(
		$READ_ONLY_SHOP_STORE?.countries.map<SelectOption>((item) => ({
			label: item.country,
			value: item.code,
		})) || [],
	);
</script>

<div class="bg-white border border-gray-200 p-3 space-y-2 rounded-lg">
	<SectionHeader>
		<dir>General information</dir>

		<ChannelSelect placeholder="channel" size="xs" class="font-normal!" />
	</SectionHeader>

	<Input required label="Name" placeholder="Name" bind:value={name} {disabled} />

	<TextArea
		required
		label="Description"
		placeholder="Description"
		bind:value={description}
		inputClass="min-h-20"
	/>

	<SectionHeader>
		<div>Countries ({countries.length})</div>
		<div class="flex gap-1">
			<Button color="red" variant="light" size="xs" endIcon={Trash}>Unassign items</Button>
			<Button color="blue" variant="light" size="xs" endIcon={Plus}>Unassign items</Button>
		</div>
	</SectionHeader>

	<Select
		label="Countries"
		placeholder="Shipping zone countries"
		multiple
		required
		bind:value={countryCodes}
		options={CountriesOptions}
	/>
</div>
