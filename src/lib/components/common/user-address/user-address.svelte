<script lang="ts">
	import { Building, Icon, MapPin, Phone } from '$lib/components/icons';
	import type { Address } from '$lib/gql/graphql';
	import type { Snippet } from 'svelte';

	type Props = {
		address: Address;
		children?: Snippet;
		class?: string;
	};

	let { address, children, class: className = '' }: Props = $props();
</script>

<div class="overflow-hidden rounded-lg border bg-white py-3 px-5 {className}">
	<h2 class="text-base font-bold leading-7 text-blue-700">{address.firstName} {address.lastName}</h2>
	<ul class="mt-2 text-gray-600 text-xs">
		<!-- place -->
		<li class="flex items-start gap-2" aria-label="Location">
			<div>
				<Icon icon={MapPin} class="text-blue-600 mt-0.5" />
			</div>
			<div>
				<p class="font-semibold">{address.streetAddress1 || address.streetAddress2}</p>
				<p>{address.countryArea || address.city}, {address.cityArea}</p>
				<p>{address.country.country}</p>
			</div>
		</li>
		<!-- phone -->
		<li class="mt-2 flex items-start gap-2" aria-label="Phone number">
			<div>
				<Icon icon={Phone} class="text-blue-600 mt-0.5" />
			</div>
			<div>
				<p class="font-semibold">{address.phone || '_'}</p>
			</div>
		</li>
		<!-- company -->
		<li class="mt-2 flex items-start gap-2" aria-label="Company">
			<div>
				<Icon icon={Building} class="text-blue-600 mt-0.5" />
			</div>
			<div>
				<p class="font-semibold">{address.companyName || '_'}</p>
			</div>
		</li>
	</ul>
	{#if children}
		<div class="mt-3">
			{@render children()}
		</div>
	{/if}
</div>
