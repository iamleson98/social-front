import type { SelectItemProps } from "$lib/components/ui/MegaMenu/types";
import type { SelectOption } from "$lib/components/ui/select";
import { 
  type CategoryCountableConnection,
  type PreorderSettingsInput,
  type ProductVariantChannelListingAddInput, 
  type StockInput
} from "$lib/gql/graphql";


export const convertCategoryEdgesToMenuSelect = (connection: CategoryCountableConnection): SelectItemProps[] => {
  const items: SelectItemProps[] = [];

  for (let i = 0; i < connection.edges.length; i++) {
    const { node } = connection.edges[i];
    const props: SelectItemProps = {
      title: node.name,
      value: node.id,
      children: node.children ? convertCategoryEdgesToMenuSelect(node.children) : undefined,
    };

    items.push(props);
  }

  return items;
}

export const PRODUCT_NAME_MAX_LENGTH = 250;
export const PRODUCT_SLUG_MAX_LENGTH = 255;

export type VariantManifestProps = {
  name: {
    value: string;
    error?: string;
  };
  values: {
    value: string;
    error?: string;
  }[];
};

export type CustomStockInput = StockInput & { warehouseName: string };

export type ChannelSelectOptionProps = SelectOption & ProductVariantChannelListingAddInput & { currency: string };

export type QuickFillHighlight =
  | 'td-channel-hl'
  | 'td-price-hl'
  | 'td-stock-hl'
  | 'td-sku-hl'
  | 'td-cost-price-hl'
  | 'td-weight-hl'
  | 'td-preorder-hl';

export type QuickFillingProps = {
  channels: ChannelSelectOptionProps[];
  /**
   * Since channels have associated warehouses, so when channels are updated, we need to update the warehouses
   */
  stocks: CustomStockInput[];
  sku?: string;
  weight?: number;
  preOrder: PreorderSettingsInput;
  trackInventory: boolean;
  quantityLimitPerCustomer?: number;
};
