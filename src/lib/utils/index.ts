import type { Component } from 'svelte';

export { getCookieByKey } from './cookies';
export { AppRoute } from './routes';
export type { SocialVariant } from './consts';

const components = [
  "a",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "button",
  "cite",
  "code",
  "data",
  "datalist",
  "dd",
  "dl",
  "dt",
  "div",
  "em",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "i",
  "input",
  "label",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "section",
  "span",
  "strong",
  "ul",
] as const;

export type SupportedElement = typeof components[number];
export type SupportedAs = SupportedElement | Component;

export const isValidElement = (elem: SupportedAs) => {
  return !(typeof elem === 'string' && !components.includes(elem));
};
