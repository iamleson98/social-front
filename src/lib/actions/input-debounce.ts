import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import type { ActionReturn } from "svelte/action";
import { debounce, fromDomEvent, pipe, subscribe } from "wonka";


type InputDebounceOpts = {
  onInput: (evt: Event) => void | (() => void);
  /** skip checking events until specific duration is up. Default to `333`  */
  debounceTime?: number;
};

export function debounceInput(node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, opts: InputDebounceOpts): ActionReturn {
  const { unsubscribe: destroy } = pipe(
    fromDomEvent(node, 'input'),
    debounce(() => opts.debounceTime || DEBOUNCE_INPUT_TIME),
    subscribe(opts.onInput)
  );

  return {
    destroy,
  };
}
