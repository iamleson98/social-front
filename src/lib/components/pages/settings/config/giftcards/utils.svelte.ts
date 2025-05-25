import { GIFT_CARD_ACTIVATE_MUTATION, GIFT_CARD_DEACTIVATE_MUTATION, GIFT_CARD_DELETE_MUTATION } from "$lib/api/admin/giftcards";
import { GRAPHQL_CLIENT } from "$lib/api/client";
import type { Mutation, MutationGiftCardActivateArgs, MutationGiftCardDeleteArgs } from "$lib/gql/graphql";
import { checkIfGraphqlResultHasError } from "$lib/utils/utils";


export class GiftcardUtil {
  async handleToggleGiftcardStatus(id: string, active: boolean) {
    const [query, resultKey, successMessage] = active
      ? [
        GIFT_CARD_ACTIVATE_MUTATION,
        'giftCardActivate' as keyof Mutation,
        `Successfully activated giftcard ${id}`,
      ]
      : [
        GIFT_CARD_DEACTIVATE_MUTATION,
        'giftCardDeactivate' as keyof Mutation,
        `Successfully deactivated giftcard ${id}`,
      ];

    const result = await GRAPHQL_CLIENT.mutation<
      Pick<Mutation, typeof resultKey>,
      MutationGiftCardActivateArgs
    >(query, {
      id,
    });

    return (checkIfGraphqlResultHasError(result, resultKey, successMessage));
  };

  async handleDeleteGiftcard(id: string) {
    const result = await GRAPHQL_CLIENT.mutation<Pick<Mutation, 'giftCardDelete'>, MutationGiftCardDeleteArgs>(GIFT_CARD_DELETE_MUTATION, {
      id,
    });

    return (checkIfGraphqlResultHasError(result, 'giftCardDelete', `Successfully deleted giftcard ${id}`));
  }
}
