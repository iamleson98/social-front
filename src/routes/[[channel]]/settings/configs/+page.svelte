<script lang="ts">
	import { tranFunc } from '$i18n';
	import { BuildingWarehouse, Category, Dimension, FolderCog, Icon } from '$lib/components/icons';
	import { Globe, UsersGroup } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';

	let items = $derived([
		{
			title: $tranFunc('product.channel'),
			description: $tranFunc('settings.channelLinkHelpTxt'),
			href: AppRoute.SETTINGS_CONFIGS_CHANNELS(),
			icon: Globe
		},
		{
			title: $tranFunc('settings.staffs'),
			description: $tranFunc('settings.staffLinkHelpTxt'),
			href: AppRoute.SETTINGS_CONFIGS_STAFFS(),
			icon: UsersGroup
		},
		{
			title: 'Users',
			description: 'Users of shop',
			href: AppRoute.SETTINGS_CONFIGS_USERS(),
			icon: UsersGroup
		},
		{
			title: 'Categories',
			description: 'Categories of shop',
			href: AppRoute.SETTINGS_CONFIGS_CATEGORIES(),
			icon: Category
		},
		{
			title: 'Collections',
			description: 'Collections of shop',
			href: AppRoute.SETTINGS_CONFIGS_COLLECTIONS(),
			icon: FolderCog
		},
		{
			title: 'Warehouses',
			description: 'Warehouses of shop',
			href: AppRoute.SETTINGS_CONFIGS_WAREHOUSES(),
			icon: BuildingWarehouse
		},
		{
			title: 'Attributes',
			description: 'Attributes of shop',
			href: AppRoute.SETTINGS_CONFIGS_ATTRIBUTES(),
			icon: Dimension
		}
	]);
</script>

<div
	class="rounded-lg bg-white border border-gray-200 px-3 py-2 flex items-center justify-between mb-3"
>
	<div class="breadcrumbs text-sm">
		<ul>
			<li><a href={AppRoute.SETTINGS_CONFIGS()}>{$tranFunc('settings.configs')}</a></li>
		</ul>
	</div>
</div>

{#snippet card(title: string, description: string, href: string, icon: string)}
	<div class="card bg-white border border-gray-200 card-sm">
		<div class="card-body">
			<h2 class="card-title">
				<Icon {icon} class="size-5" />
				<span>{title}</span>
			</h2>
			<p>
				{description}
			</p>
			<div class="justify-end card-actions">
				<Button {href} size="xs" variant="light">{$tranFunc('btn.goto')}</Button>
			</div>
		</div>
	</div>
{/snippet}

<dir class="grid grid-cols-2 mobile-l:grid-cols-1 gap-2">
	{#each items as item, idx (idx)}
		{@render card(item.title, item.description, item.href, item.icon)}
	{/each}
</dir>
