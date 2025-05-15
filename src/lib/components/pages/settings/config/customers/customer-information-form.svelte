<script lang="ts">
	import { tranFunc } from '$i18n';
	import { Checkbox, Input, TextArea } from '$lib/components/ui/Input';
	import { Table, type TableColumnProps } from '$lib/components/ui/Table';
	import { type MetadataInput, type Order, type OrderSortField } from '$lib/gql/graphql';
	import { object, string, z } from 'zod';
	import MetadataEditor from '$lib/components/pages/settings/common/metadata-editor.svelte';
	import dayjs from 'dayjs';
	import { Badge } from '$lib/components/ui/Badge';
	import { paymentStatusBadgeClass } from '$lib/utils/utils';
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';

	type Props = {
		firstName: string;
		lastName: string;
		email: string;
		isActive: boolean;
		note: string;
		disabled?: boolean;
		orders: Order[];
		metadata: MetadataInput[];
		privateMetadata: MetadataInput[];
	};

	let {
		firstName = $bindable(''),
		lastName = $bindable(''),
		email = $bindable(''),
		isActive = $bindable(false),
		note = $bindable(''),
		disabled,
		orders,
		metadata = $bindable([]),
		privateMetadata = $bindable([])
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');

	const customerSchema = object({
		firstName: string().nonempty(REQUIRED_ERROR),
		lastName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		note: string().nonempty(REQUIRED_ERROR)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;

	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	const validate = () => {
		const result = customerSchema.safeParse({
			firstName,
			lastName,
			email,
			note
		});
		if (!result.success) {
			customerFormErrors = result.error.formErrors.fieldErrors;
			return false;
		}
		customerFormErrors = {};
		return true;
	};

	const ORDER_TABLE_COLUMNS: TableColumnProps<Order, OrderSortField>[] = [
		{
			title: 'Number',
			child: number
		},
		{
			title: 'Date',
			child: date
		},
		{
			title: 'Status',
			child: status
		},
		{
			title: 'Total',
			child: total
		}
	];
</script>

{#snippet number({ item }: { item: Order })}
	<span>{item.number}</span>
{/snippet}

{#snippet date({ item }: { item: Order })}
	<span class="whitespace-nowrap">{dayjs(item.created).format('DD/MM/YYYY HH:mm')}</span>
{/snippet}

{#snippet status({ item }: { item: Order })}
	<Badge {...paymentStatusBadgeClass(item.paymentStatus)} />
{/snippet}

{#snippet total({ item }: { item: Order })}
	<span>{item.total.gross.currency} {item.total.gross.amount}</span>
{/snippet}

<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-3">
	<h3 class="font-semibold text-gray-700">Customer Information</h3>
	<div class="flex flex-row gap-3 items-start">
		<Input
			label="First Name"
			bind:value={firstName}
			required
			{disabled}
			class="flex-1"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.firstName?.length ? 'error' : 'info'}
			subText={customerFormErrors.firstName?.length ? customerFormErrors.firstName[0] : undefined}
		/>

		<Input
			label="Last Name"
			bind:value={lastName}
			required
			{disabled}
			class="flex-1"
			inputDebounceOption={{ onInput: validate }}
			onblur={validate}
			variant={customerFormErrors.lastName?.length ? 'error' : 'info'}
			subText={customerFormErrors.lastName?.length ? customerFormErrors.lastName[0] : undefined}
		/>
	</div>

	<Input
		label="Email"
		bind:value={email}
		required
		{disabled}
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.email?.length ? 'error' : 'info'}
		subText={customerFormErrors.email?.length ? customerFormErrors.email[0] : undefined}
	/>

	<Checkbox label="Active" bind:checked={isActive} />

	<TextArea
		bind:value={note}
		placeholder="Note"
		label="Note"
		required
		{disabled}
		inputClass="min-h-20"
		inputDebounceOption={{ onInput: validate }}
		onblur={validate}
		variant={customerFormErrors.note?.length ? 'error' : 'info'}
		subText={customerFormErrors.note?.length ? customerFormErrors.note[0] : undefined}
	/>

	{#if orders.length <= 0}
		<Alert variant="info" size="sm" bordered={false}>This customer has no orders</Alert>
	{:else}
		<div class="flex justify-between items-center">
			<h3 class="font-semibold text-gray-700">Recent Orders</h3>
			<Button variant="light" size="xs">View all orders</Button>
		</div>
		<Table columns={ORDER_TABLE_COLUMNS} items={orders} />
	{/if}

	<MetadataEditor title="Metadata" bind:data={metadata} />
	<MetadataEditor title="Private Metadata" bind:data={privateMetadata} />
</div>
