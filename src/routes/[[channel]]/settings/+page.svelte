<script lang="ts">
	import AddressManagement from '$lib/components/pages/settings/me/addresses-manage.svelte';
	import BasicInfoForm from '$lib/components/pages/settings/me/basic-info-form.svelte';
	import PasswordChangeForm from '$lib/components/pages/settings/me/password-change-form.svelte';
</script>

<div class="m-auto">
	<BasicInfoForm />
	<AddressManagement />
	<PasswordChangeForm />
</div>
