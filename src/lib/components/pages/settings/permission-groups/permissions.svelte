<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { Permission } from '$lib/gql/graphql';
	import { READ_ONLY_USER_STORE } from '$lib/stores/auth';

	type Props = {
		permissions: Permission[];
		editable?: boolean;
		disabled?: boolean;
	};

	let { permissions, editable = true, disabled = false }: Props = $props();
</script>

<div class="w-2/5 space-y-2 bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader>Your Permissions</SectionHeader>

	<Alert size="sm" bordered variant="info">Checked fields are your permissions</Alert>

	<div class="grid grid-cols-2 gap-2">
		{#each permissions as permission, idx (idx)}
			<div class="ring ring-gray-200 p-2 rounded-lg text-xs text-gray-700 flex items-start gap-0.5">
				<Checkbox
					size="sm"
					checked={$READ_ONLY_USER_STORE?.userPermissions?.some((p) => p.code === permission.code)}
					readonly={!editable || disabled}
				/>
				<div>
					<div class="font-medium">{permission.name}</div>
					<div class="wrap-anywhere text-gray-500">{permission.code}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
