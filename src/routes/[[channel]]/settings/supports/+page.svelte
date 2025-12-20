<script lang="ts">
	import { T } from '$i18n';
	import { Dots, Edit, Trash } from '$lib/components/icons';
	import { Badge } from '$lib/components/ui/Badge';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown } from '$lib/components/ui/Dropdown';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { type SupportTicketStatus, type SupportTicketTag } from '$lib/utils/types';
	import { supportTicketStatusToBadgeClass, supportTicketTagToBadgeClass } from '$lib/utils/utils';
	import dayjs from 'dayjs';

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
			title: $T('settings.title'),
			child: title,
		},
		{
			title: $T('settings.tag'),
			child: tag,
		},
		{
			title: $T('settings.status'),
			child: status,
		},
		{
			title: $T('settings.date'),
			child: { render: ({ item }) => dayjs(item.createdAt).format(SitenameTimeFormat) },
			key: 'createdAt',
		},
		{
			title: $T('settings.action'),
			child: action,
		},
	]);

	const handleConfirmDeleteTicket = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: $T('settings.confirmDelRequest', { id }),
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

{#snippet status({ item }: { item: SupportTicket })}
	<Badge {...supportTicketStatusToBadgeClass(item.status)}>{item.status}</Badge>
{/snippet}

{#snippet tag({ item }: { item: SupportTicket })}
	<Badge {...supportTicketTagToBadgeClass(item.tag)}>{item.tag}</Badge>
{/snippet}

{#snippet action({ item }: { item: SupportTicket })}
	<DropDown
		placement="left"
		options={[
			{
				children: $T('settings.editTicket'),
				href: `${AppRoute.ME_SUPPORT()}/${item.id}`,
				startIcon: Edit,
			},
			{
				children: $T('settings.deleteTicket'),
				startIcon: Trash,
				class: 'text-red-600',
				onclick: () => handleConfirmDeleteTicket(item.id),
			},
		]}
	>
		{#snippet trigger({ ...rest })}
			<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
		{/snippet}
	</DropDown>
{/snippet}

<Table {items} columns={ORDER_TABLE_COLUMNS}></Table>
