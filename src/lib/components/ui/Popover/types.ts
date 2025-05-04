import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import type { EventHandler } from "svelte/elements";
import { debounce, fromDomEvent, merge, pipe, subscribe } from "wonka";

export type DropdownTriggerInterface = {
  onclick?: EventHandler<MouseEvent>;
  onfocus?: EventHandler<FocusEvent>;
};

type commonEventDebounceOpts = {
  onFire: () => void
};

const resizeSubscribers = new Set<() => void>();
let unsub: (() => void) | null = null;

export const dropdownResizeDebounce = (
  node: HTMLElement | Window,
  { onFire }: commonEventDebounceOpts
) => {
  resizeSubscribers.add(onFire);
  const destroy = () => {
    resizeSubscribers.delete(onFire);
    if (!resizeSubscribers.size) {
      unsub?.();
      unsub = null;
    }
  };

  if (unsub) return destroy;

  const eventListeners = ['resize', 'scroll'].map(evt => fromDomEvent(node as HTMLElement, evt));

  const { unsubscribe } = pipe(
    merge(eventListeners),
    debounce(() => DEBOUNCE_INPUT_TIME),
    subscribe(() => resizeSubscribers.forEach(_onFire => _onFire())),
  );

  unsub = unsubscribe;
  return destroy;
};