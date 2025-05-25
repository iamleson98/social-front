import { GIFT_CARD_ACTIVATE_MUTATION, GIFT_CARD_DEACTIVATE_MUTATION } from "$lib/api/admin/giftcards";
import { GRAPHQL_CLIENT } from "$lib/api/client";
import type { Mutation, MutationGiftCardActivateArgs } from "$lib/gql/graphql";
import { checkIfGraphqlResultHasError } from "$lib/utils/utils";


export class GiftcardUtil {
  private _loading = $state(false);

  get loading() {
    return this._loading;
  }

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

    this._loading = true; //

    const result = await GRAPHQL_CLIENT.mutation<
      Mutation[typeof resultKey],
      MutationGiftCardActivateArgs
    >(query, {
      id,
    });

    this._loading = false; //

    return (checkIfGraphqlResultHasError(result, resultKey, successMessage));
  };
}
