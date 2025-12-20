<script lang="ts">
	import { T } from '$i18n';
	import { Alert } from '$lib/components/ui/Alert';
	import { Input } from '$lib/components/ui/Input';
	import { Modal } from '$lib/components/ui/Modal';
	import type { Order } from '$lib/gql/graphql';
	import { createSchemaHandler } from '$lib/utils/zod.svelte';
	import { OrderUtilsInstance } from './utils.svelte';
	import toast from 'svelte-french-toast';
	import { number, object, string } from 'zod';

	type Props = {
		open: boolean;
		order: Order;
	};

	let { open = $bindable(), order }: Props = $props();

	let values = $state({
		description: '',
		pspReference: '',
		amount: 0,
	});

	const TransactionSchema = object({
		description: string().nonempty($T('helpText.fieldRequired')),
		amount: number().positive($T('error.negativeNumber')),
	});

	const SchemaHandler = createSchemaHandler(TransactionSchema, () => values);

	const handleCaptureTransaction = async () => {
		if (!SchemaHandler.validate()) return;

		const success = await OrderUtilsInstance.transactionCreate(
			order.id,
			{
				name: 'Manual capture',
				pspReference: values.pspReference,
				amountCharged: {
					amount: values.amount,
					currency: order.channel.currencyCode,
				},
			},
			{
				message: values.description,
				pspReference: values.pspReference,
			},
		);

		if (success) {
			toast.success('Transaction created successfully');
			open = false;
		}
	};
</script>

<Modal
	size="xs"
	bind:open
	onOk={handleCaptureTransaction}
	header="Capture manual transaction"
	closeOnEscape
	closeOnOutsideClick
>
	<div class="space-y-2">
		<Alert size="sm">Create a manual transaction for non-integrated payments</Alert>
		<Input
			label="Description"
			required
			size="sm"
			placeholder="description"
			bind:value={values.description}
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			variant={$SchemaHandler.description?.length ? 'error' : 'info'}
			subText={$SchemaHandler.description?.[0]}
		/>
		<Input
			label="Psp reference"
			size="sm"
			placeholder="psp reference"
			bind:value={values.pspReference}
		/>
		<Input
			label="Amount"
			min={0}
			required
			inputDebounceOption={{ onInput: SchemaHandler.validate }}
			onblur={SchemaHandler.validate}
			variant={$SchemaHandler.amount?.length ? 'error' : 'info'}
			subText={$SchemaHandler.amount?.[0]}
			size="sm"
			type="number"
			bind:value={values.amount}
		>
			{#snippet action()}
				<span class="text-[10px] font-bold">{order.channel.currencyCode}</span>
			{/snippet}
		</Input>
	</div>
</Modal>
