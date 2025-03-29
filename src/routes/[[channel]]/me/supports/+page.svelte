<script lang="ts">
	import { Icon, Plus, TagFilled } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
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
			// sortable: true,
			child: title
		},
		{
			title: 'Date',
			child: date
			// sortable: true
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Tag',
			child: tag
		}
		// {
		// 	title: 'Total',
		// 	child: total
		// }
	];
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

<div class="mt-3 rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<!-- <Label label="Support Tickets" size="lg" /> -->
	<div>tickets</div>
	<div>
		<Button size="xs" endIcon={Plus} href={AppRoute.ME_SUPPORT_NEW()}>New Ticket</Button>
	</div>
</div>

<div class="rounded-lg bg-white border border-gray-200 mt-3">
	<Table {items} columns={ORDER_TABLE_COLUMNS}></Table>
</div>
