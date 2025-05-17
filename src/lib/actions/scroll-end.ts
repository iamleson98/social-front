import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import type { ActionReturn } from "svelte/action";
import { debounce, filter, fromDomEvent, pipe, subscribe } from "wonka";


export type OnscrollToEndOpts = {
  onScrollToEnd: (evt?: Event) => void;
  /** skip checking events until specific duration is up. Default to `333`  */
  debounceTime?: number;
};

/**
 * this action listens to scroll event on the given node and calls the `onScrollToEnd` callback when the scroll reaches the end of the node.
 * It's useful for infinite scrolling.
 * @param node the node to listen to scroll event
 * @param opts the options for the action
 */
export function scrollToEnd(node: HTMLElement, opts: OnscrollToEndOpts): ActionReturn {
  const { unsubscribe: destroy } = pipe(
    fromDomEvent(node, 'scroll'),
    debounce(() => opts.debounceTime || DEBOUNCE_INPUT_TIME),
    filter(() => (node.clientHeight + node.scrollTop + 4) >= node.scrollHeight),
    subscribe(opts.onScrollToEnd)
  );

  return {
    destroy,
  };
};
