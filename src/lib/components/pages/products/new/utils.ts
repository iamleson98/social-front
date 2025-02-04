import type { SelectItemProps } from "$lib/components/ui/MegaMenu/types";
import type { CategoryCountableConnection } from "$lib/gql/graphql";


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
