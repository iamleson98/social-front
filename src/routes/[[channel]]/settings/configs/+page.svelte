<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Icon } from '$lib/components/icons';
	import { Globe, UsersGroup } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { AppRoute } from '$lib/utils';

	let items = $derived([
		{
			title: 'product.channel',
			description: 'settings.channelLinkHelpTxt',
			href: AppRoute.SETTINGS_CONFIGS_CHANNELS(),
			icon: Globe
		},
		{
			title: 'settings.staffs',
			description: 'settings.staffLinkHelpTxt',
			href: AppRoute.SETTINGS_CONFIGS_STAFFS(),
			icon: UsersGroup
		}
	]);
</script>

{#snippet card(title: string, description: string, href: string, icon: string)}
	<div class="card bg-white border border-gray-200 card-sm w-[49.5%]">
		<div class="card-body">
			<h2 class="card-title">
				<Icon {icon} class="size-5" />
				<span>{$tranFunc(title)}</span>
			</h2>
			<p>
				{$tranFunc(description)}
			</p>
			<div class="justify-end card-actions">
				<Button {href} size="xs" variant="light">{$tranFunc('btn.goto')}</Button>
			</div>
		</div>
	</div>
{/snippet}

<dir class="flex flex-wrap gap-2 justify-between">
	{#each items as item, idx (idx)}
		{@render card(item.title, item.description, item.href, item.icon)}
	{/each}
</dir>
