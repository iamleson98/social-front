<script lang="ts">
	import { tranFunc } from '$i18n';
	import { USER_ORDERS_QUERY } from '$lib/api/orders';
	import { Checkbox, Input, TextArea } from '$lib/components/ui/Input';
	import { GraphqlPaginableTable, Table, type TableColumnProps } from '$lib/components/ui/Table';
	import type { Order, OrderSortField, QueryOrdersArgs } from '$lib/gql/graphql';
	import { object, string, z } from 'zod';

	type Props = {
		firstName: string;
		lastName: string;
		email: string;
		isActive: boolean;
		note: string;
		disabled?: boolean;
		orders: Order[];
	};

	let {
		firstName = $bindable(''),
		lastName = $bindable(''),
		email = $bindable(''),
		isActive = $bindable(false),
		note = $bindable(''),
		disabled,
		orders
	}: Props = $props();

	const REQUIRED_ERROR = $tranFunc('helpText.fieldRequired');
	const DESCRIPTION_MAX_LENGTH = 300;

	const customerSchema = object({
		firstName: string().nonempty(REQUIRED_ERROR),
		lastName: string().nonempty(REQUIRED_ERROR),
		email: string().nonempty(REQUIRED_ERROR).email($tranFunc('error.invalidEmail')),
		note: string()
			.nonempty(REQUIRED_ERROR)
			.max(DESCRIPTION_MAX_LENGTH, `Note must be at most ${DESCRIPTION_MAX_LENGTH} characters long`)
	});

	type CustomerSchema = z.infer<typeof customerSchema>;

	let customerFormErrors = $state.raw<Partial<Record<keyof CustomerSchema, string[]>>>({});

	const validate = () => {
		const result = customerSchema.safeParse({
			firstName,
			lastName,
			email
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
	<span>{item.created}</span>
{/snippet}
{#snippet status({ item }: { item: Order })}
	<span>{item.paymentStatus}</span>
{/snippet}
{#snippet total({ item }: { item: Order })}
	<span>{item.total.gross.amount}</span>
{/snippet}
<div class="bg-white rounded-lg border w-full border-gray-200 p-3 pb-6 flex flex-col gap-3">
	<div class="flex flex-row gap-2 items-start">
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

	<Checkbox label="Is active" bind:checked={isActive} />

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
		subText={customerFormErrors.note?.length
			? customerFormErrors.note[0]
			: `${note?.length || 0} / ${DESCRIPTION_MAX_LENGTH}`}
	/>

	<Table
		columns={ORDER_TABLE_COLUMNS}
		items={orders}
	/>
</div>
