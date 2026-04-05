<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { Alert } from '$lib/components/ui/Alert';
	import { Badge } from '$lib/components/ui/Badge';
	import { Checkbox } from '$lib/components/ui/Input';
	import {
		Table,
		TableSkeleton,
		type TableCellProps,
		type TableColumnProps,
	} from '$lib/components/ui/Table';
	import type { BookingTransportBrand } from '$lib/types/booking';
	import { AppRoute } from '$lib/utils';
	import { BackendHttpClient } from '$lib/utils/api';
	import { SitenameTimeFormat } from '$lib/utils/consts';
	import { createQuery } from '@tanstack/svelte-query';
	import dayjs from 'dayjs';

	const BrandsQuery = createQuery(() => ({
		queryKey: ['transportBrands'],
		queryFn: async () =>
			BackendHttpClient.getBookingTransportBrands({
				limit: 20,
				offset: 0,
			}),
	}));

	const Columns: TableColumnProps<BookingTransportBrand, any>[] = [
		{
			title: 'Name',
			child: brandName,
		},
		{
			title: 'Email',
			child: { render: ({ item }) => item.email },
		},
		{
			title: 'Created At',
			child: { render: ({ item }) => dayjs(item.createat).format(SitenameTimeFormat) },
		},
		{
			title: 'Active',
			child: active,
		},
	];
</script>

{#snippet brandName({ item }: TableCellProps<BookingTransportBrand>)}
	<a href={AppRoute.BookingTransportBrandDetails(item.id)} class="text-blue-600 hover:underline">
		{item.name}
	</a>
{/snippet}

{#snippet active({ item }: TableCellProps<BookingTransportBrand>)}
	<Badge color={item.deleteat ? 'red' : 'green'} text={item.deleteat ? 'Inactive' : 'Active'}
	></Badge>
{/snippet}

{#if BrandsQuery.isFetching}
	<TableSkeleton numOfRows={3} numColumns={3} />
{:else if BrandsQuery.isError}
	<Alert variant="error" size="sm" bordered>
		{BrandsQuery.error.message}
	</Alert>
{:else if BrandsQuery.isSuccess && BrandsQuery.data}
	<Table
		columns={Columns}
		items={BrandsQuery.data}
		restPagination={{
			totalCount: BrandsQuery.data.length,
			rowsPerPage: 20,
		}}
	/>
{/if}
