export const randomID = () => '_' + Math.random().toString(36).substring(2, 9);

export type PaginationOptions = {
  before?: string | null | undefined;
  after?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
};

export function constructPagination<T extends PaginationOptions>(before?: string, after?: string, first?: number, last?: number) {
  const pagination: Pick<T, 'before' | 'after' | 'first' | 'last'> = {};
  if (before) {
    pagination.before = before;
  } else if (after) {
    pagination.after = after;
  }
  if (first) {
    pagination.first = first;
  } else if (last) {
    pagination.last = last;
  }
  return pagination;
};

export const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: "currency",
    currency,
  }).format(amount);
};
