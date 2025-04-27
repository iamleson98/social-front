<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Icon } from '$lib/components/icons';
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
		}
	]);
</script>

{#snippet card(title: string, description: string, href: string, icon: string)}
	<div class="w-1/2 mobile-l:w-full p-0.5">
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
	</div>
{/snippet}

<dir class="flex flex-wrap flex-row mobile-l:flex-col">
	{#each items as item, idx (idx)}
		{@render card(item.title, item.description, item.href, item.icon)}
	{/each}
</dir>
