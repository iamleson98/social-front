import type { ActionReturn } from "svelte/action";
import { matchesShortcut } from "./shortcut";

interface Options {
  onOutclick?: (event: MouseEvent | FocusEvent) => void;
  onEscape?: (event: KeyboardEvent) => void;
}

export function clickOutside(node: HTMLElement, options: Options = {}): ActionReturn {
  const { onOutclick, onEscape } = options;

  const handleClick = (event: MouseEvent) => {
    const targetNode = event.target as Node | null;
    if (node.contains(targetNode)) {
      return;
    }

    onOutclick?.(event);
  };

  const handleKey = (event: KeyboardEvent) => {
    if (!matchesShortcut(event, { key: 'Escape' })) {
      return;
    }

    if (onEscape) {
      event.stopPropagation();
      onEscape(event);
    }
  };

  document.addEventListener('click', handleClick, true);
  node.addEventListener('keydown', handleKey, false);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
      node.removeEventListener('keydown', handleKey, false);
    },
  };
}
