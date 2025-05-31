
import type { LanguageCodeEnum, QueryCheckoutArgs } from "$lib/gql/graphql";

export type CustomQueryCheckoutArgs = { languageCode?: LanguageCodeEnum } & QueryCheckoutArgs;

/**According to graphql backend */
export type SupportTicketStatus = 'PENDING' | 'IN_PROGRESS' | 'CLOSED';

/**According to graphql backend */
export type SupportTicketTag = 'WARRANTY' | 'CONSULT';

export type MediaObject = {
  id?: string;
  file: File;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type?: 'document' | 'image';
};
