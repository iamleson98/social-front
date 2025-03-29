<script lang="ts">
	import { page } from '$app/state';
	import {
		AdjustmentHorizontal,
		Icon,
		MailQuestion,
		Order,
		UserCog,
		type IconType
	} from '$lib/components/icons';
	import { AccordionList } from '$lib/components/ui/Accordion';
	import { AppRoute } from '$lib/utils';

	type TabItem = {
		icon: IconType;
		name?: string;
		href: string;
		children?: TabItem[];
	};

	const ACCOUNT_TAB_ITEMS: TabItem[] = [
		{
			icon: UserCog,
			name: 'Account',
			href: AppRoute.ME()
		},
		{
			icon: AdjustmentHorizontal,
			name: 'Preference',
			href: AppRoute.ME_PREFERENCES()
		}
	];

	const SHOPPING_TAB_ITEMS: TabItem[] = [
		{
			icon: Order,
			name: 'My Orders',
			href: AppRoute.MY_ORDERS()
		},
		{
			icon: MailQuestion,
			name: 'Supports',
			href: AppRoute.ME_SUPPORT(),
			children: [
				{
					href: AppRoute.ME_SUPPORT_NEW(),
					icon: MailQuestion,
				},
			]
		}
	];
</script>

{#snippet sidebarItem(item: TabItem)}
	{@const attrs = item.href ? { href: item.href } : {}}
	{@const active = item.href == page.url.pathname || item.children?.some(child => child.href == page.url.pathname)}
	<svelte:element
		this={item.href ? 'a' : 'div'}
		{...attrs}
		class="flex items-center gap-2 rounded-md p-2 py-2.5 {active
			? 'bg-blue-100 text-blue-700 font-semibold before:content-[" "] before:h-full before:w-2 before:rounded-sm before:bg-blue-500 before:absolute before:right-[calc(100%+4px)]'
			: ''} hover:bg-blue-100 hover:text-blue-700 cursor-pointer relative"
	>
		<Icon icon={item.icon} />
		<span>{item.name}</span>
	</svelte:element>
{/snippet}

<div class="w-1/4">
	<AccordionList header="Account" child={sidebarItem} items={ACCOUNT_TAB_ITEMS} class="w-full" />

	<AccordionList header="Shopping" child={sidebarItem} items={SHOPPING_TAB_ITEMS} class="w-full" />
</div>
