import { tick } from "svelte";
import { shortcuts } from "./shortcut";

const selectors =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const focusTrap = (container: HTMLElement) => {
  const triggerElem = document.activeElement;

  const focusableElem = container.querySelector<HTMLElement>(selectors);

  void tick().then(() => focusableElem?.focus());

  const getFocusableElements = () => {
    const focusableElems = container.querySelectorAll<HTMLElement>(selectors);
    return [
      focusableElems.item(0),
      focusableElems.item(focusableElems.length - 1),
    ];
  };

  const { destroy: destroyShortcuts } = shortcuts(container, [
    {
      ignoreInputFields: false,
      preventDefault: false,
      shortcut: { key: "Tab" },
      onShortcut: (evt) => {
        const [firstElement, lastElement] = getFocusableElements();
        if (document.activeElement === lastElement) {
          evt.preventDefault();
          firstElement?.focus();
        }
      },
    },
    {
      ignoreInputFields: false,
      preventDefault: false,
      shortcut: { key: 'Tab', shift: true },
      onShortcut: (event) => {
        const [firstElement, lastElement] = getFocusableElements();
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      },
    },
  ]);

  return {
    destroy() {
      destroyShortcuts?.();
      if (triggerElem instanceof HTMLElement) {
        triggerElem.focus();
      }
    },
  };
};
