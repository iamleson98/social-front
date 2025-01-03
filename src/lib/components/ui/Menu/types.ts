import type { IconType } from "$lib/components/icons";
import type { Component, Snippet } from "svelte";
import type { EventHandler } from "svelte/elements";

export type DropDownMenuItemProps = {
  label: string;
  value: string | number
  startIcon?: IconType
};

type DropMenuTriggerInterface = {
  onclick: EventHandler;
};

export type DropDownMenuProps = {
  trigger: Snippet<[DropMenuTriggerInterface]>;
  // children: Snippet;
  selectItems: Array<DropDownMenuItemProps>
  onSelect: (item: DropDownMenuItemProps) => void
};

export type MenuState = 'open' | 'closed';

export type MenuItemData = {
  textValue: string;
  disabled: boolean;
};

export type RenderStrategy = 'unmount' | 'hidden'

export type StateDefinition = {
  menuState: MenuState;
  items: { id: string; data: MenuItemData }[];
  searchQuery: string;
  activeItemIndex: number | null;
  closeMenu: () => void;
  openMenu: () => void;
  gotoItem: (focus: Focus, id?: string) => void;
  search: (value: string) => void;
  clearSearch: () => void;
  registerItem: (id: string, dataRef: MenuItemData) => void;
  unregisterItem: (id: string) => void;
}

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

export type Focus = 'first' | 'previous' | 'next' | 'last' | 'specific' | 'nothing';

export function calculateActiveIndex<TItem>(
  action:
    | { focus: 'specific'; id: string }
    | { focus: Exclude<Focus, 'specific'> },
  resolvers: {
    resolveItems(): TItem[];
    resolveActiveIndex(): number | null;
    resolveId(item: TItem): string;
    resolveDisabled(item: TItem): boolean;
  }
) {
  const items = resolvers.resolveItems();
  if (items.length <= 0) return null;

  const currentActiveIndex = resolvers.resolveActiveIndex();
  const activeIndex = currentActiveIndex ?? -1;

  const nextActiveIndex = (() => {
    switch (action.focus) {
      case 'first':
        return items.findIndex((item) => !resolvers.resolveDisabled(item));

      case 'previous': {
        const idx = items
          .slice()
          .reverse()
          .findIndex((item, idx, all) => {
            if (activeIndex !== -1 && all.length - idx - 1 >= activeIndex)
              return false;
            return !resolvers.resolveDisabled(item);
          });
        if (idx === -1) return idx;
        return items.length - 1 - idx;
      }

      case 'next':
        return items.findIndex((item, idx) => {
          if (idx <= activeIndex) return false;
          return !resolvers.resolveDisabled(item);
        });

      case 'last': {
        const idx = items
          .slice()
          .reverse()
          .findIndex((item) => !resolvers.resolveDisabled(item));
        if (idx === -1) return idx;
        return items.length - 1 - idx;
      }

      case 'specific':
        return items.findIndex(
          (item) => resolvers.resolveId(item) === action.id
        );

      case 'nothing':
        return null;

      default:
        assertNever(action);
    }
  })();

  return nextActiveIndex === -1 ? currentActiveIndex : nextActiveIndex;
}

export type SupportedAs =
  "a" |
  "address" |
  "article" |
  "aside" |
  "b" |
  "bdi" |
  "bdo" |
  "blockquote" |
  "button" |
  "cite" |
  "code" |
  "data" |
  "datalist" |
  "dd" |
  "dl" |
  "dt" |
  "div" |
  "em" |
  "footer" |
  "form" |
  "h1" |
  "h2" |
  "h3" |
  "h4" |
  "h5" |
  "h6" |
  "header" |
  "i" |
  "input" |
  "label" |
  "li" |
  "main" |
  "nav" |
  "ol" |
  "p" |
  "section" |
  "span" |
  "strong" |
  "ul" |
  Component;

// export type SupportedElement = typeof components[number];
// export type SupportedAs = SupportedElement | Component;

// check if the argument element below is a valid SupportedAs value except Component

// export function isValidElement(element: SupportedAs) {
//   return !(typeof element === "string" && !components.includes(element));
// }
