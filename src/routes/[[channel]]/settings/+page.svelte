<script lang="ts">
	import AddressManagement from '$lib/components/pages/settings/addresses-manage.svelte';
	import BasicInfoForm from '$lib/components/pages/settings/basic-info-form.svelte';
	import PasswordChangeForm from '$lib/components/pages/settings/password-change-form.svelte';
</script>

<div class="m-auto">
	<BasicInfoForm />
	<AddressManagement />
	<PasswordChangeForm />
</div>
