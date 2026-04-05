<script lang="ts">
	import { goto } from '$app/navigation';
	import GeneralForm from '$lib/components/pages/settings/booking/transport-brands/general-form.svelte';
	import { ActionBar } from '$lib/components/pages/settings/common';
	import type { BookingTransportBrand } from '$lib/types/booking';
	import { AppRoute } from '$lib/utils';
	import { BackendHttpClient } from '$lib/utils/api';
	import { createMutation } from '@tanstack/svelte-query';
	import toast from 'svelte-french-toast';

	let formOk = $state(false);

	let brandForm = $state<BookingTransportBrand>({
		name: '',
		email: '',
		representor_id: '',
		phone: '',
		description: '',
	} as BookingTransportBrand);

	const CreateBrandMutation = createMutation(() => ({
		mutationKey: ['createTransportBrand'],
		mutationFn: async (newBrand: BookingTransportBrand) =>
			await BackendHttpClient.createBookingTransportBrand(newBrand),
		onSuccess: async (brand) => {
			if (brand) {
				toast.success('Transport brand created successfully');
				await goto(AppRoute.BookingTransportBrandDetails(brand.id));
			}
		},
		onError: (err) => {
			toast.error('Failed to create transport brand: ' + err.message);
		},
	}));

	const handleCreate = async () => {
		if (formOk) await CreateBrandMutation.mutateAsync(brandForm);
	};
</script>

<GeneralForm
	bind:name={brandForm.name}
	bind:email={brandForm.email}
	bind:representor_id={brandForm.representor_id}
	bind:phone={brandForm.phone}
	bind:description={brandForm.description}
	bind:formOk
	disabled={CreateBrandMutation.isPending}
/>

<ActionBar
	disabled={CreateBrandMutation.isPending}
	onAddClick={handleCreate}
	backButtonUrl={AppRoute.BookingTransportBrands()}
	disableBackButton={CreateBrandMutation.isPending}
	disableCreateButton={!formOk}
/>
