import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import { noop } from "$lib/utils/utils";
import type { ActionReturn } from "svelte/action";
import { debounce, fromDomEvent, merge, pipe, scan, subscribe } from "wonka";


export type InputDebounceOpts = {
  onInput: (result: unknown) => void;
  /** skip checking events until specific duration is up. Default to `333`  */
  debounceTime?: number;
};

export type ClickDebounceOpts = {
  /** default to `true`  */
  resetCounter?: boolean;
} & InputDebounceOpts;

/**
 * @doc debounceInput keeps track of the input value on an input element and emits the value after a specific duration. 
 * This is useful for preventing multiple events firing on an input element.
 * @param node Input element
 * @param opts options for the debounce action
 * @returns 
 */
export function debounceInput(node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, opts?: InputDebounceOpts): ActionReturn {
  if (!opts) {
    return { destroy: noop };
  }

  const { unsubscribe: destroy } = pipe(
    fromDomEvent(node, 'input'),
    debounce(() => opts.debounceTime || DEBOUNCE_INPUT_TIME),
    subscribe(opts.onInput),
  );

  return {
    destroy,
  };
};

type WindowEventType = 'resize' | 'scroll';

type CommonDebounceOpts = {
  events: WindowEventType[];
  time: number;
  onDone: () => void
};

export const commonDebounce = (node: HTMLElement, opts: CommonDebounceOpts): ActionReturn => {
  const { unsubscribe } = pipe(
    merge(
      opts.events.map(event => fromDomEvent(node, event))
    ),
    debounce(() => opts.time || DEBOUNCE_INPUT_TIME),
    subscribe(opts.onDone)
  )
  return {
    destroy: unsubscribe,
  };
};

/**
 * @doc debounceClick keeps track of the number of clicks on a button and emits the count after a specific duration. 
 * This is useful for preventing multiple clicks event firing on an element.
 * @param node Focusable DOM element
 * @param opts options for the debounce action
 * @returns 
 */
export const debounceClick = (node: HTMLElement, opts?: ClickDebounceOpts): ActionReturn => {
  if (!opts) return { destroy: noop };

  let counter = 0;
  if (opts.resetCounter === undefined) opts.resetCounter = true;

  const { unsubscribe: destroy } = pipe(
    fromDomEvent(node, 'click'),
    scan(() => ++counter, 0),
    debounce(() => opts.debounceTime || DEBOUNCE_INPUT_TIME),
    subscribe(value => {
      opts.onInput(value);
      if (opts.resetCounter) counter = 0;
    }),
  );

  return { destroy };
};
