<script lang="ts">
	import { Dots, Edit, Icon, TagFilled, Trash } from '$lib/components/icons';
	// import { Button } from '$lib/components/ui';
	import { IconButton } from '$lib/components/ui/Button';
	import { DropDown, type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	// import { AlertModal } from '$lib/components/ui/Modal';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { ALERT_MODAL_STORE } from '$lib/stores/ui/alert-modal';
	import { AppRoute } from '$lib/utils';
	import {
		supportTicketStatusToBadgeClass,
		supportTicketTagToBadgeClass,
		type SupportTicketStatus,
		type SupportTicketTag
	} from '$lib/utils/types';
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
			tag: 'WARRANTY'
		},
		{
			id: '2',
			title: 'Support ticket 2 and it is pretty long and lets see is it does overflow',
			message: 'Message 2',
			status: 'IN_PROGRESS',
			createdAt: '2023-01-01',
			updatedAt: '2023-01-01',
			tag: 'CONSULT'
		}
	];

	const ORDER_TABLE_COLUMNS: TableColumnProps<SupportTicket>[] = [
		{
			title: 'Title',
			child: title
		},
		{
			title: 'Tag',
			child: tag
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Date',
			child: date,
			sortable: true
		},
		{
			title: 'Action',
			child: action
		}
	];

	const handleConfirmDeleteTicket = (id: string) => {
		ALERT_MODAL_STORE.openAlertModal({
			content: `Are you sure you want to delete ticket '${id}'?`,
			onOk: () => {},
			onCancel: () => {}
		});
	}
</script>

{#snippet title({ item }: { item: SupportTicket })}
	{item.title}
{/snippet}

{#snippet date({ item }: { item: SupportTicket })}
	{dayjs(item.createdAt).format('MMMM D, YYYY [at] h:mm A')}
{/snippet}

{#snippet status({ item }: { item: SupportTicket })}
	<span class="{supportTicketStatusToBadgeClass(item.status)} badge badge-sm badge-outline"
		>{item.status}</span
	>
{/snippet}

{#snippet tag({ item }: { item: SupportTicket })}
	<span class="{supportTicketTagToBadgeClass(item.tag)} badge badge-sm badge-outline">
		<Icon icon={TagFilled} class="size-3" />
		{item.tag}
	</span>
{/snippet}

{#snippet action({ item }: { item: SupportTicket })}
	{#snippet trigger({ ...rest }: DropdownTriggerInterface)}
		<IconButton icon={Dots} {...rest} size="xs" variant="light" color="gray" />
	{/snippet}
	<DropDown
		{trigger}
		options={[
			{
				children: 'Edit ticket',
				href: `${AppRoute.ME_SUPPORT_NEW()}?id=${item.id}`,
				startIcon: Edit
			},
			{
				children: 'Delete ticket',
				startIcon: Trash,
				class: 'text-red-600',
				onclick: () => handleConfirmDeleteTicket(item.id)
			}
		]}
	/>
{/snippet}

<!-- <div class="mt-3 rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<div>Tickets</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.ME_SUPPORT_NEW()}>New Ticket</Button>
	</div>
</div> -->

<div class="rounded-lg bg-white border border-gray-200 mt-3 p-3">
	<Table {items} columns={ORDER_TABLE_COLUMNS}></Table>
</div>
