import { DEBOUNCE_INPUT_TIME } from "$lib/utils/consts";
import type { EventHandler } from "svelte/elements";
import { debounce, fromDomEvent, merge, pipe, subscribe } from "wonka";


/**
 * Popover requires a trigger component to open and close the popover.
 * It empower your creativity to create any kind of component as long as it implements the DropdownTriggerInterface.
 * For example, Button component already implements this interface.
 */
export type DropdownTriggerInterface = {
  onclick?: EventHandler<MouseEvent | TouchEvent>;
  onfocus?: EventHandler<FocusEvent | TouchEvent>;
  /** in case you want to close the popover by yourself */
  onclose?: () => void;
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