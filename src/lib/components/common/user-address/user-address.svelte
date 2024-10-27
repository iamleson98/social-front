<script lang="ts">
	import { Building, Icon, MapPin, Phone } from '$lib/components/icons';
	import type { Address } from '$lib/gql/graphql';
	import type { Snippet } from 'svelte';

	type Props = {
		address: Address;
		children?: Snippet;
	};

	let { address, children }: Props = $props();
</script>

<div class="mx-auto overflow-hidden rounded-lg border bg-white p-4">
	<h2 class="text-lg font-bold leading-8">{address.firstName} {address.lastName}</h2>
	<ul class="mt-4 text-gray-600">
		<!-- place -->
		<li class="mt-3 flex items-start">
			<div>
				<Icon icon={MapPin} class="text-blue-600" />
			</div>
			<div>
				<p class="font-medium">{address.streetAddress1 || address.streetAddress2}</p>
				<p class="text-sm">{address.cityArea}, {address.city}</p>
				<p class="text-sm">{address.country}</p>
			</div>
		</li>
		<!-- phone -->
		<li class="mt-3 flex items-start">
			<div>
				<Icon icon={Phone} class="text-blue-600" />
			</div>
			<div>
				<p class="font-medium">{address.phone || '_'}</p>
			</div>
		</li>
		<!-- company -->
		<li class="mt-3 flex items-start">
			<div>
				<Icon icon={Building} class="text-blue-600" />
			</div>
			<div>
				<p class="font-medium">{address.companyName || '_'}</p>
			</div>
		</li>
	</ul>
	{#if children}
		<div class="mt-3">
			{@render children()}
		</div>
	{/if}
</div>
