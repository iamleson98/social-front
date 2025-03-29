<script lang="ts">
	import { page } from '$app/state';
	import { Send } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { Select } from '$lib/components/ui/select';
	import { onMount } from 'svelte';
	import { object, string, z } from 'zod';

	const TicketSchema = object({
		title: string().min(1, 'Title is required'),
		tag: string().min(1, 'Tag is required'),
		message: string().min(1, 'Message is required'),
		orderNo: string().min(1, 'Order number is required')
	});

	type TicketInput = z.infer<typeof TicketSchema>;

	let ticketInput = $state<TicketInput>({
		title: '',
		tag: '',
		message: '',
		orderNo: ''
	});

	onMount(() => {
		const orderNumber = page.url.searchParams.get('order_number');
		if (orderNumber) {
			ticketInput.orderNo = orderNumber;
		}
	});

	let ticketErrors = $state<Partial<Record<keyof TicketInput, string[]>>>({});

	const validate = () => {
		const result = TicketSchema.safeParse(ticketInput);
		if (!result.success) {
			ticketErrors = result.error.formErrors.fieldErrors;
			return false;
		}
		ticketErrors = {};
		return true;
	};

	const handleSubmit = () => {
		if (!validate()) return;
	};
</script>

<div class="mt-3 rounded-lg bg-white border border-gray-200 p-3 flex items-center justify-between">
	<div>Compose new ticket</div>
</div>

<div class="mt-3 p-3 rounded-lg bg-white border border-gray-200">
	<Input
		placeholder="Ticket title"
		label="Title"
		required
		bind:value={ticketInput.title}
		variant={ticketErrors.title?.length ? 'error' : 'info'}
		subText={ticketErrors.title?.length ? ticketErrors.title[0] : ''}
	/>

	<div class="mt-2 flex items-start gap-2 flex-row">
		<Select
			options={[
				{
					value: 'CONSULT',
					label: 'Consult'
				},
				{
					value: 'WARRANTY',
					label: 'Warranty'
				}
			]}
			label="Tag"
			required
			bind:value={ticketInput.tag}
			variant={ticketErrors.tag?.length ? 'error' : 'info'}
			subText={ticketErrors.tag?.length ? ticketErrors.tag[0] : ''}
		/>
		<Select
			options={[]}
			label="Order"
			required
			bind:value={ticketInput.orderNo}
			variant={ticketErrors.orderNo?.length ? 'error' : 'info'}
			subText={ticketErrors.orderNo?.length ? ticketErrors.orderNo[0] : ''}
		/>
	</div>

	<TextArea
		class="mt-2"
		label="Message"
		placeholder="Enter your message"
		inputClass="min-h-20"
		required
		bind:value={ticketInput.message}
		variant={ticketErrors.message?.length ? 'error' : 'info'}
		subText={ticketErrors.message?.length ? ticketErrors.message[0] : ''}
	/>

	<div class="text-right mt-2">
		<Button size="sm" endIcon={Send} onclick={handleSubmit}>Submit</Button>
	</div>
</div>
