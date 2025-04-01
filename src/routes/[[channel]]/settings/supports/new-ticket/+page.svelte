<script lang="ts">
	import { page } from '$app/state';
	import { operationStore } from '$lib/api/operation';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { Send } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input, TextArea } from '$lib/components/ui/Input';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { Skeleton, SkeletonContainer } from '$lib/components/ui/Skeleton';
	import type { Query } from '$lib/gql/graphql';
	import type { PaginationOptions } from '$lib/utils/utils';
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

	const BATCH_LOAD = 20;

	const userOrdersStore = operationStore<Pick<Query, 'me'>, PaginationOptions>({
		kind: 'query',
		requestPolicy: 'cache-and-network',
		query: USER_ORDERS_QUERY,
		variables: {
			first: BATCH_LOAD
		}
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
		<div class="w-1/2">
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
		</div>
		<div class="w-1/2">
			{#if $userOrdersStore.fetching}
				<SkeletonContainer>
					<Skeleton class="h-4 w-full" />
				</SkeletonContainer>
			{:else if $userOrdersStore.error}
				<Alert size="sm" variant="error" class="mb-3" bordered>
					{$userOrdersStore.error.message}
				</Alert>
			{:else if $userOrdersStore.data?.me}
				{@const items =
					$userOrdersStore.data.me.orders?.edges.map<SelectOption>((item) => ({
						value: item.node.number,
						label: item.node.number
					})) || []}

				<Select
					options={items}
					label="Order"
					required
					bind:value={ticketInput.orderNo}
					variant={ticketErrors.orderNo?.length ? 'error' : 'info'}
					subText={ticketErrors.orderNo?.length ? ticketErrors.orderNo[0] : ''}
				/>
			{/if}
		</div>
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
