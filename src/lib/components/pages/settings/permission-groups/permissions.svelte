<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { Permission, PermissionEnum } from '$lib/gql/graphql';
	import { READ_ONLY_SHOP_STORE } from '$lib/stores/shop';
	import { addNoDup } from '$lib/utils/utils';

	type Props = {
		/** permission set of this group only */
		permissions: Permission[];
		editable?: boolean;
		disabled?: boolean;
		addPermissions?: PermissionEnum[];
		removePermissions?: PermissionEnum[];
	};

	let {
		permissions,
		editable = true,
		disabled = false,
		addPermissions = $bindable([]),
		removePermissions = $bindable([]),
	}: Props = $props();

	const permissionsMap = $derived(
		$READ_ONLY_SHOP_STORE?.permissions?.reduce(
			(acc, cur) => {
				if (permissions.some((perm) => perm.code === cur.code) || addPermissions.includes(cur.code))
					acc[cur.code] = true;

				return acc;
			},
			{} as Record<PermissionEnum, boolean>,
		),
	);

	const handleUpdatePermissions = (code: PermissionEnum, checked: boolean) => {
		if (checked && !permissions.some((item) => item.code === code))
			addPermissions = addNoDup(addPermissions, code);
		else if (!checked && permissions.some((item) => item.code === code))
			removePermissions = addNoDup(removePermissions, code);
	};

	$inspect(addPermissions, removePermissions);
</script>

<div class="w-2/5 space-y-2 bg-white rounded-lg border border-gray-200 p-3">
	<SectionHeader>Your Permissions</SectionHeader>

	<Alert size="sm" bordered variant="info">Checked fields are your permissions</Alert>

	<div class="grid grid-cols-2 gap-2">
		{#each $READ_ONLY_SHOP_STORE?.permissions || [] as permission, idx (idx)}
			<div class="ring ring-gray-200 p-2 rounded-lg text-xs text-gray-700 flex items-start gap-0.5">
				<Checkbox
					size="sm"
					checked={permissionsMap?.[permission.code]}
					readonly={!editable || disabled}
					onCheckChange={(checked) => handleUpdatePermissions(permission.code, checked)}
				/>
				<div>
					<div class="font-medium">{permission.name}</div>
					<div class="wrap-anywhere text-gray-500">{permission.code}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
