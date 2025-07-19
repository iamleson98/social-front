<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { type SupportTicketStatus, type SupportTicketTag } from '$lib/utils/types';
	import dayjs from 'dayjs';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Popover';
	import { supportTicketStatusToBadgeClass, supportTicketTagToBadgeClass } from '$lib/utils/utils';
	import { Badge } from '$lib/components/ui/badge';
	import { SitenameTimeFormat } from '$lib/utils/consts';

	type SupportTicket = {
		id: string;
		title: string;
		message: string;
		status: SupportTicketStatus;
		tag: SupportTicketTag;
		createdAt: string;
		updatedAt: string;
	};

	const items: SupportTicket[] = [
		{
			id: '1',
			title: 'Support ticket 1',
			message: 'Message 1',
			status: 'PENDING',
			createdAt: '2023-01-01',
			updatedAt: '2023-01-01',
			tag: 'WARRANTY',
		},
		{
			id: '2',
			title: 'Support ticket 2 and it is pretty long and lets see is it does overflow',
			message: 'Message 2',
			status: 'IN_PROGRESS',
			createdAt: '2023-01-01',
			updatedAt: '2023-01-01',
			tag: 'CONSULT',
		},
	];

	const ORDER_TABLE_COLUMNS: TableColumnProps<SupportTicket, string>[] = $derived([
		{
			title: $tranFunc('settings.title'),
			child: title,
		},
		{
			title: $tranFunc('settings.tag'),
			child: tag,
		},
		{
			title: $tranFunc('settings.status'),
			child: status,
		},
		{
			title: $tranFunc('settings.date'),
			child: date,
			key: 'createdAt',
		},
		{
			title: $tranFunc('settings.action'),
			child: action,
		},
	]);

	const handleConfirmDeleteTicket = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $tranFunc('settings.confirmDelRequest', { id }),
			onOk: () => {},
			onCancel: () => {},
		});
	};
</script>

{#snippet title({ item }: { item: SupportTicket })}
	<a class="link" href="{AppRoute.ME_SUPPORT()}/{item.id}" aria-label={item.title}>
		{item.title}
	</a>
{/snippet}

{#snippet date({ item }: { item: SupportTicket })}
	{dayjs(item.createdAt).format(SitenameTimeFormat)}
{/snippet}

{#snippet status({ item }: { item: SupportTicket })}
	<Badge {...supportTicketStatusToBadgeClass(item.status)}>{item.status}</Badge>
{/snippet}

{#snippet tag({ item }: { item: SupportTicket })}
	<Badge {...supportTicketTagToBadgeClass(item.tag)}>{item.tag}</Badge>
{/snippet}

{#snippet action({ item }: { item: SupportTicket })}
	{#snippet trigger({ ...rest }: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown
		{trigger}
		options={[
			{
				children: $tranFunc('settings.editTicket'),
				href: `${AppRoute.ME_SUPPORT()}/${item.id}`,
				startIcon: Edit,
			},
			{
				children: $tranFunc('settings.deleteTicket'),
				startIcon: Trash,
				class: 'text-red-600',
				onclick: () => handleConfirmDeleteTicket(item.id),
			},
		]}
	/>
{/snippet}

<div class="rounded-lg bg-white border border-gray-200 mt-3 p-3">
	<Table {items} columns={ORDER_TABLE_COLUMNS}></Table>
</div>
