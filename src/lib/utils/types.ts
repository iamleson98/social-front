
import type { LanguageCodeEnum, QueryCheckoutArgs } from "$lib/gql/graphql";

export type CustomQueryCheckoutArgs = { languageCode?: LanguageCodeEnum } & QueryCheckoutArgs;

/**According to graphql backend */
export type SupportTicketStatus = 'PENDING' | 'IN_PROGRESS' | 'CLOSED';

/**According to graphql backend */
export type SupportTicketTag = 'WARRANTY' | 'CONSULT';

export const supportTicketStatusToBadgeClass = (status: SupportTicketStatus) => {
  switch (status) {
    case 'PENDING':
      return 'badge-primary';
    case 'IN_PROGRESS':
      return 'badge-secondary';
    case 'CLOSED':
      return 'badge-success';
    default:
      return 'badge-neutral badge-dash';
  }
}

export const supportTicketTagToBadgeClass = (tag: SupportTicketTag) => {
  switch (tag) {
    case 'WARRANTY':
      return 'badge-primary';
    case 'CONSULT':
      return 'badge-secondary';
    default:
      return 'badge-neutral badge-dash';
  }
}
