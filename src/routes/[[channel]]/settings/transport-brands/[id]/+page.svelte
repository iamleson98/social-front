<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import GeneralFormSkeleton from '$lib/components/pages/settings/booking/transport-brands/general-form-skeleton.svelte';
	import GeneralForm from '$lib/components/pages/settings/booking/transport-brands/general-form.svelte';
	import { ActionBar } from '$lib/components/pages/settings/common';
	import { Alert } from '$lib/components/ui/Alert';
	import { AlertModalStore } from '$lib/stores/ui/alert-modal';
	import type { BookingTransportBrand } from '$lib/types/booking';
	import { AppRoute } from '$lib/utils';
	import { BackendHttpClient } from '$lib/utils/api';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { pick } from 'es-toolkit';
	import toast from 'svelte-french-toast';

	let formOk = $state(false);

	let brandForm = $state<BookingTransportBrand>({
		id: '',
		name: '',
		email: '',
		representor_id: '',
		phone: '',
		description: '',
	});

	const BrandQuery = createQuery(() => ({
		queryKey: ['brand'],
		queryFn: async () => BackendHttpClient.getBookingTransportBrand(page.params.id as string),
	}));

	$effect(() => {
		if (BrandQuery.isSuccess && BrandQuery.data) {
			brandForm = pick(BrandQuery.data, [
				'id',
				'name',
				'email',
				'representor_id',
				'phone',
				'description',
			]);
		}
	});

	const BrandUpdateMutation = createMutation(() => ({
		mutationKey: ['updateTransportBrand'],
		mutationFn: async (updatedBrand: BookingTransportBrand) =>
			await BackendHttpClient.updateBookingTransportBrand(updatedBrand.id, updatedBrand),
		onSuccess: async (brand) => {
			toast.success('Transport brand updated successfully');
			await goto(AppRoute.BookingTransportBrandDetails(brand.id));
		},
		onError: (err) => {
			toast.error('Failed to update transport brand: ' + err.message);
		},
	}));

	const BrandDeleteMutation = createMutation(() => ({
		mutationKey: ['deleteTransportBrand'],
		mutationFn: async (id: string) => await BackendHttpClient.deleteBookingTransportBrand(id),
		onSuccess: async () => {
			toast.success('Transport brand deleted successfully');
			await goto(AppRoute.BookingTransportBrands());
		},
		onError: (err) => {
			toast.error('Failed to delete transport brand: ' + err.message);
		},
	}));

	const handleUpdate = async () => {
		if (formOk) await BrandUpdateMutation.mutateAsync(brandForm);
	};

	const handleDelete = async () => {
		AlertModalStore.openAlertModal({
			content: 'Are you sure you want to delete this transport brand?',
			onOk: async () => await BrandDeleteMutation.mutateAsync(brandForm.id),
			variant: 'warning',
		});
	};
</script>

{#if BrandQuery.isFetching}
	<GeneralFormSkeleton />
{:else if BrandQuery.isError}
	<Alert variant="error">{BrandQuery.error.message}</Alert>
{:else if BrandQuery.isSuccess && BrandQuery.data}
	<GeneralForm
		bind:name={brandForm.name}
		bind:email={brandForm.email}
		bind:representor_id={brandForm.representor_id}
		bind:phone={brandForm.phone}
		bind:description={brandForm.description}
		bind:formOk
		disabled={BrandUpdateMutation.isPending}
	/>

	<ActionBar
		disabled={BrandUpdateMutation.isPending || BrandDeleteMutation.isPending}
		onUpdateClick={handleUpdate}
		backButtonUrl={AppRoute.BookingTransportBrands()}
		disableBackButton={BrandUpdateMutation.isPending || BrandDeleteMutation.isPending}
		disableUpdateButton={!formOk}
		onDeleteClick={handleDelete}
	/>
{/if}
