<script lang="ts">
	import {
	billing,
		Building,
		Check,
		Icon,
		MapPin,
		Phone,
		TruckDelivery
	} from '$lib/components/icons';
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
	<h2 class="text-base font-bold leading-7 text-blue-700">
		{address.firstName}
		{address.lastName}
	</h2>
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

		<!-- billing -->
		<li class="mt-2 flex items-start gap-2" aria-label="Default Billing Address">
			<div>
				<Icon icon={billing} class="text-blue-600 mt-0.5" />
			</div>
			<div>
				{#if address.isDefaultBillingAddress}
					<div class="flex items-center gap-1">
						<Icon icon={Check} class="text-green-600" />
						<span>Default billing address</span>
					</div>
				{/if}
			</div>
		</li>
		<!-- shipping -->
		<li class="mt-2 flex items-start gap-2" aria-label="Default Shipping Address">
			<div>
				<Icon icon={TruckDelivery} class="text-blue-600 mt-0.5" />
			</div>
			<div>
				{#if address.isDefaultShippingAddress}
					<div class="flex items-center gap-1">
						<Icon icon={Check} class="text-green-600" />
						<span>Default shipping address</span>
					</div>
				{/if}
			</div>
		</li>
	</ul>
	{#if children}
		<div class="mt-3">
			{@render children()}
		</div>
	{/if}
</div>
