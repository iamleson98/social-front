
import { GRAPHQL_CLIENT } from "$lib/api/client";
import type { Mutation, MutationDraftOrderDeleteArgs } from "$lib/gql/graphql";
import { checkIfGraphqlResultHasError } from "$lib/utils/utils";
import { ORDER_DELETE_MUTATION } from "$lib/api/orders";


export class OrderUtil {
  async handleDeleteOrder(id: string) {
    const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'draftOrderDelete'>, MutationDraftOrderDeleteArgs>(ORDER_DELETE_MUTATION, {
      id,
    });

    return (checkIfGraphqlResultHasError(result, 'draftOrderDelete', `Successfully deleted order ${id}`));
  }
}
