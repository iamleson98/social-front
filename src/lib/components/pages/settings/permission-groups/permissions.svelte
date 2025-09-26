<script lang="ts">
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import { Checkbox } from '$lib/components/ui/Input';
	import type { Permission, PermissionEnum } from '$lib/gql/graphql';
	import { ShopStoreManager } from '$lib/stores/shop';
	import { addNoDup, classNames, SitenameCommonClassName } from '$lib/utils/utils';

	type Props = {
		/** permission set of this group only */
		permissions?: Permission[];
		editable?: boolean;
		/** indicates if current user can edit this group */
		disabled?: boolean;
		addPermissions?: PermissionEnum[];
		removePermissions?: PermissionEnum[];
	};

	let {
		permissions = [],
		editable = true,
		disabled = false,
		addPermissions = $bindable([]),
		removePermissions = $bindable([]),
	}: Props = $props();

	const AvailablePermissions =
		$ShopStoreManager?.permissions
			?.filter((perm1) => !permissions.some((perm) => perm1.code === perm.code))
			.map((perm) => perm.code) || [];

	const handleUpdatePermissions = (code: PermissionEnum, checked: boolean) => {
		if (checked) {
			if (!permissions.some((perm) => perm.code === code)) {
				addPermissions = addNoDup(addPermissions, code);
			}
			if (removePermissions.includes(code)) {
				removePermissions = removePermissions.filter((perm) => perm !== code);
			}
		} else {
			if (permissions.some((perm) => perm.code === code)) {
				removePermissions = addNoDup(removePermissions, code);
			}
			if (addPermissions.includes(code)) {
				addPermissions = addPermissions.filter((perm) => perm !== code);
			}
		}
	};

	const handleToggleAssignAllPermissions = (checked: boolean) => {
		if (checked) {
			addPermissions = AvailablePermissions;
			removePermissions = [];
		} else {
			addPermissions = [];
			removePermissions = [];
		}
	};
</script>

<div class="w-2/5 {SitenameCommonClassName}">
	<SectionHeader>Your Permissions</SectionHeader>

	<Checkbox
		label="Assign all permissions"
		subText="Select this checkbox to assign all permissions to this group"
		checked={permissions.length === $ShopStoreManager?.permissions?.length}
		readonly={!editable || disabled}
		onCheckChange={handleToggleAssignAllPermissions}
		{disabled}
	/>

	<div class="grid grid-cols-2 gap-2">
		{#each $ShopStoreManager?.permissions || [] as permission, idx (idx)}
			{@const isAdding = addPermissions.includes(permission.code)}
			{@const isRemoving = removePermissions.includes(permission.code)}
			{@const checked = permissions.some((perm) => perm.code === permission.code) || isAdding}
			<div
				class={classNames('ring ring-gray-200 p-2 rounded-lg text-xs text-gray-700 wrap-anywhere', {
					'ring-red-300! bg-red-50': isRemoving,
					'ring-blue-300! bg-blue-50': isAdding,
				})}
			>
				<Checkbox
					size="sm"
					{checked}
					{disabled}
					readonly={!editable || disabled}
					onCheckChange={(checked) => handleUpdatePermissions(permission.code, checked)}
					label={permission.name}
					subText={permission.code}
				/>
			</div>
		{/each}
	</div>
</div>
