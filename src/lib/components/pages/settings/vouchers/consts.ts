import { VoucherTypeEnum } from "$lib/gql/graphql";

export const APPLICATION_TYPES: Record<VoucherTypeEnum, string> = {
  [VoucherTypeEnum.EntireOrder]: 'voucher.applyEntireOrder',
  [VoucherTypeEnum.SpecificProduct]: 'voucher.applySpecificPrd',
  [VoucherTypeEnum.Shipping]: 'voucher.discountShip',
};

export type TabName = 'categories' | 'products' | 'collections' | 'variants';
export const TABS: TabName[] = ['categories', 'products', 'collections', 'variants'];

