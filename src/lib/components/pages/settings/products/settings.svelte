<script lang="ts">
	import { T } from '$i18n';
	import { SettingCog } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type MenuItemProps } from '$lib/components/ui/Dropdown';

	/*
	 * Product CSV/XLSX export was removed from the Saleor core API (3.24).
	 * Exports are expected to be handled by dedicated apps or external tools
	 * querying the GraphQL API directly, so this menu is intentionally empty
	 * of the removed "Export products" entry.
	 */
	const options: MenuItemProps[] = [];
</script>

{#if options.length}
	<DropDown placement="bottom-end" {options}>
		{#snippet trigger({ onclick })}
			<IconButton
				size="sm"
				icon={SettingCog}
				color="gray"
				{onclick}
				class="tooltip tooltip-left"
				data-tip={$T('common.settings')}
			/>
		{/snippet}
	</DropDown>
{/if}
