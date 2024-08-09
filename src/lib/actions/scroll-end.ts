import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import type { ActionReturn } from "svelte/action";
import { debounce, filter, fromDomEvent, pipe, subscribe } from "wonka";


type OnscrollToEndOpts = {
  onScrollToEnd: (evt?: Event) => void;
  /** skip checking events until specific duration is up. Default to `333`  */
  debounceTime?: number;
};

export function scrollToEnd(node: HTMLElement, opts: OnscrollToEndOpts): ActionReturn {
  const { unsubscribe: destroy } = pipe(
    fromDomEvent(node, 'scroll'),
    debounce(() => opts.debounceTime || DEBOUNCE_INPUT_TIME),
    filter(() => node.clientHeight + node.scrollTop === node.scrollHeight),
    subscribe(opts.onScrollToEnd)
  );

  return {
    destroy,
  };
};
