import { $applyNodeReplacement, $createRangeSelection, $createTextNode, $getSelection, $isElementNode, $isLineBreakNode, $isNodeSelection, $isRangeSelection, $isTextNode, $setSelection, createCommand, createEditor, DecoratorNode, ElementNode, getDOMSelectionFromTarget, isHTMLElement, TextNode, type DOMConversionMap, type DOMConversionOutput, type DOMExportOutput, type EditorConfig, type LexicalCommand, type LexicalEditor, type LexicalNode, type LexicalUpdateJSON, type NodeKey, type SerializedEditor, type SerializedLexicalNode, type Spread } from "lexical";
import {
  $createAutoLinkNode,
  $isAutoLinkNode,
  AutoLinkNode,
} from '@lexical/link';
import type { AutoLinkAttributes } from '@lexical/link';

export interface ImagePayload {
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src: string;
  width?: number;
  captionsEnabled?: boolean;
}


function isPreviousNodeValid(node: LexicalNode): boolean {
  let previousNode = node.getPreviousSibling();
  if ($isElementNode(previousNode)) {
    previousNode = previousNode.getLastDescendant();
  }
  return (
    previousNode === null ||
    $isLineBreakNode(previousNode) ||
    ($isTextNode(previousNode) &&
      endsWithSeparator(previousNode.getTextContent()))
  );
}

function isNextNodeValid(node: LexicalNode): boolean {
  let nextNode = node.getNextSibling();
  if ($isElementNode(nextNode)) {
    nextNode = nextNode.getFirstDescendant();
  }
  return (
    nextNode === null ||
    $isLineBreakNode(nextNode) ||
    ($isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent()))
  );
}

function isContentAroundIsValid(
  matchStart: number,
  matchEnd: number,
  text: string,
  nodes: TextNode[],
): boolean {
  const contentBeforeIsValid =
    matchStart > 0
      ? isSeparator(text[matchStart - 1])
      : isPreviousNodeValid(nodes[0]);
  if (!contentBeforeIsValid) {
    return false;
  }

  const contentAfterIsValid =
    matchEnd < text.length
      ? isSeparator(text[matchEnd])
      : isNextNodeValid(nodes[nodes.length - 1]);
  return contentAfterIsValid;
}

function extractMatchingNodes(
  nodes: TextNode[],
  startIndex: number,
  endIndex: number,
): [
    matchingOffset: number,
    unmodifiedBeforeNodes: TextNode[],
    matchingNodes: TextNode[],
    unmodifiedAfterNodes: TextNode[],
  ] {
  const unmodifiedBeforeNodes: TextNode[] = [];
  const matchingNodes: TextNode[] = [];
  const unmodifiedAfterNodes: TextNode[] = [];
  let matchingOffset = 0;

  let currentOffset = 0;
  const currentNodes = [...nodes];

  while (currentNodes.length > 0) {
    const currentNode = currentNodes[0];
    const currentNodeText = currentNode.getTextContent();
    const currentNodeLength = currentNodeText.length;
    const currentNodeStart = currentOffset;
    const currentNodeEnd = currentOffset + currentNodeLength;

    if (currentNodeEnd <= startIndex) {
      unmodifiedBeforeNodes.push(currentNode);
      matchingOffset += currentNodeLength;
    } else if (currentNodeStart >= endIndex) {
      unmodifiedAfterNodes.push(currentNode);
    } else {
      matchingNodes.push(currentNode);
    }
    currentOffset += currentNodeLength;
    currentNodes.shift();
  }
  return [
    matchingOffset,
    unmodifiedBeforeNodes,
    matchingNodes,
    unmodifiedAfterNodes,
  ];
}

function $createAutoLinkNode_(
  nodes: TextNode[],
  startIndex: number,
  endIndex: number,
  match: LinkMatcherResult,
): TextNode | undefined {
  const linkNode = $createAutoLinkNode(match.url, match.attributes);
  if (nodes.length === 1) {
    let remainingTextNode = nodes[0];
    let linkTextNode;
    if (startIndex === 0) {
      [linkTextNode, remainingTextNode] = remainingTextNode.splitText(endIndex);
    } else {
      [, linkTextNode, remainingTextNode] = remainingTextNode.splitText(
        startIndex,
        endIndex,
      );
    }
    const textNode = $createTextNode(match.text);
    textNode.setFormat(linkTextNode.getFormat());
    textNode.setDetail(linkTextNode.getDetail());
    textNode.setStyle(linkTextNode.getStyle());
    linkNode.append(textNode);
    linkTextNode.replace(linkNode);
    return remainingTextNode;
  } else if (nodes.length > 1) {
    const firstTextNode = nodes[0];
    let offset = firstTextNode.getTextContent().length;
    let firstLinkTextNode;
    if (startIndex === 0) {
      firstLinkTextNode = firstTextNode;
    } else {
      [, firstLinkTextNode] = firstTextNode.splitText(startIndex);
    }
    const linkNodes = [];
    let remainingTextNode;
    for (let i = 1; i < nodes.length; i++) {
      const currentNode = nodes[i];
      const currentNodeText = currentNode.getTextContent();
      const currentNodeLength = currentNodeText.length;
      const currentNodeStart = offset;
      const currentNodeEnd = offset + currentNodeLength;
      if (currentNodeStart < endIndex) {
        if (currentNodeEnd <= endIndex) {
          linkNodes.push(currentNode);
        } else {
          const [linkTextNode, endNode] = currentNode.splitText(
            endIndex - currentNodeStart,
          );
          linkNodes.push(linkTextNode);
          remainingTextNode = endNode;
        }
      }
      offset += currentNodeLength;
    }
    const selection = $getSelection();
    const selectedTextNode = selection
      ? selection.getNodes().find($isTextNode)
      : undefined;
    const textNode = $createTextNode(firstLinkTextNode.getTextContent());
    textNode.setFormat(firstLinkTextNode.getFormat());
    textNode.setDetail(firstLinkTextNode.getDetail());
    textNode.setStyle(firstLinkTextNode.getStyle());
    linkNode.append(textNode, ...linkNodes);
    // it does not preserve caret position if caret was at the first text node
    // so we need to restore caret position
    if (selectedTextNode && selectedTextNode === firstLinkTextNode) {
      if ($isRangeSelection(selection)) {
        textNode.select(selection.anchor.offset, selection.focus.offset);
      } else if ($isNodeSelection(selection)) {
        textNode.select(0, textNode.getTextContent().length);
      }
    }
    firstLinkTextNode.replace(linkNode);
    return remainingTextNode;
  }
  return undefined;
}

function findFirstMatch(
  text: string,
  matchers: Array<LinkMatcher>,
): LinkMatcherResult | null {
  for (let i = 0; i < matchers.length; i++) {
    const match = matchers[i](text);

    if (match) {
      return match;
    }
  }

  return null;
}

export type ChangeHandler = (url: string | null, prevUrl: string | null) => void;

export function $handleLinkCreation(
  nodes: TextNode[],
  matchers: Array<LinkMatcher>,
  onChange: ChangeHandler,
): void {
  let currentNodes = [...nodes];
  const initialText = currentNodes
    .map((node) => node.getTextContent())
    .join('');
  let text = initialText;
  let match;
  let invalidMatchEnd = 0;

  while ((match = findFirstMatch(text, matchers)) && match !== null) {
    const matchStart = match.index;
    const matchLength = match.length;
    const matchEnd = matchStart + matchLength;
    const isValid = isContentAroundIsValid(
      invalidMatchEnd + matchStart,
      invalidMatchEnd + matchEnd,
      initialText,
      currentNodes,
    );

    if (isValid) {
      const [matchingOffset, , matchingNodes, unmodifiedAfterNodes] =
        extractMatchingNodes(
          currentNodes,
          invalidMatchEnd + matchStart,
          invalidMatchEnd + matchEnd,
        );

      const actualMatchStart = invalidMatchEnd + matchStart - matchingOffset;
      const actualMatchEnd = invalidMatchEnd + matchEnd - matchingOffset;
      const remainingTextNode = $createAutoLinkNode_(
        matchingNodes,
        actualMatchStart,
        actualMatchEnd,
        match,
      );
      currentNodes = remainingTextNode
        ? [remainingTextNode, ...unmodifiedAfterNodes]
        : unmodifiedAfterNodes;
      onChange(match.url, null);
      invalidMatchEnd = 0;
    } else {
      invalidMatchEnd += matchEnd;
    }

    text = text.substring(matchEnd);
  }
}

// Bad neighbors are edits in neighbor nodes that make AutoLinks incompatible.
// Given the creation preconditions, these can only be simple text nodes.
export function handleBadNeighbors(
  textNode: TextNode,
  matchers: Array<LinkMatcher>,
  onChange: ChangeHandler,
): void {
  const previousSibling = textNode.getPreviousSibling();
  const nextSibling = textNode.getNextSibling();
  const text = textNode.getTextContent();

  if (
    $isAutoLinkNode(previousSibling) &&
    !previousSibling.getIsUnlinked() &&
    (!startsWithSeparator(text) ||
      startsWithTLD(text, previousSibling.isEmailURI()))
  ) {
    previousSibling.append(textNode);
    handleLinkEdit(previousSibling, matchers, onChange);
    onChange(null, previousSibling.getURL());
  }

  if (
    $isAutoLinkNode(nextSibling) &&
    !nextSibling.getIsUnlinked() &&
    !endsWithSeparator(text)
  ) {
    replaceWithChildren(nextSibling);
    handleLinkEdit(nextSibling, matchers, onChange);
    onChange(null, nextSibling.getURL());
  }
}

function replaceWithChildren(node: ElementNode): Array<LexicalNode> {
  const children = node.getChildren();
  const childrenLength = children.length;

  for (let j = childrenLength - 1; j >= 0; j--) {
    node.insertAfter(children[j]);
  }

  node.remove();
  return children.map((child) => child.getLatest());
}

export function getTextNodesToMatch(textNode: TextNode): TextNode[] {
  // check if next siblings are simple text nodes till a node contains a space separator
  const textNodesToMatch = [textNode];
  let nextSibling = textNode.getNextSibling();
  while (
    nextSibling !== null &&
    $isTextNode(nextSibling) &&
    nextSibling.isSimpleText()
  ) {
    textNodesToMatch.push(nextSibling);
    if (/[\s]/.test(nextSibling.getTextContent())) {
      break;
    }
    nextSibling = nextSibling.getNextSibling();
  }
  return textNodesToMatch;
}

/**
 * Check if the text content starts with a fullstop followed by a top-level domain.
 * Meaning if the text content can be a beginning of a top level domain.
 * @param textContent
 * @param isEmail
 * @returns boolean
 */
function startsWithTLD(textContent: string, isEmail: boolean): boolean {
  if (isEmail) {
    return /^\.[a-zA-Z]{2,}/.test(textContent);
  } else {
    return /^\.[a-zA-Z0-9]{1,}/.test(textContent);
  }
}

const PUNCTUATION_OR_SPACE = /[.,;\s]/;

function isSeparator(char: string): boolean {
  return PUNCTUATION_OR_SPACE.test(char);
}

export function endsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[textContent.length - 1]);
}

export function startsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[0]);
}

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

export const convertObjectToCssStyles = (obj: Record<string, string>) => {
  return Object.keys(obj).map(key => `${key}: ${obj[key]};`).join('');
};

export const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;


export function createLinkMatcherWithRegExp(
  regExp: RegExp,
  urlTransformer: (text: string) => string = (text) => text,
) {
  return (text: string) => {
    const match = regExp.exec(text);
    if (match === null) {
      return null;
    }
    return {
      index: match.index,
      length: match[0].length,
      text: match[0],
      url: urlTransformer(match[0]),
    };
  };
}

export const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text.startsWith('http') ? text : `https://${text}`;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];

type LinkMatcherResult = {
  attributes?: AutoLinkAttributes;
  index: number;
  length: number;
  text: string;
  url: string;
};

export type LinkMatcher = (text: string) => LinkMatcherResult | null;

export function handleLinkEdit(
  linkNode: AutoLinkNode,
  matchers: Array<LinkMatcher>,
  onChange: ChangeHandler,
): void {
  // Check children are simple text
  const children = linkNode.getChildren();
  const childrenLength = children.length;
  for (let i = 0; i < childrenLength; i++) {
    const child = children[i];
    if (!$isTextNode(child) || !child.isSimpleText()) {
      replaceWithChildren(linkNode);
      onChange(null, linkNode.getURL());
      return;
    }
  }

  // Check text content fully matches
  const text = linkNode.getTextContent();
  const match = findFirstMatch(text, matchers);
  if (match === null || match.text !== text) {
    replaceWithChildren(linkNode);
    onChange(null, linkNode.getURL());
    return;
  }

  // Check neighbors
  if (!isPreviousNodeValid(linkNode) || !isNextNodeValid(linkNode)) {
    replaceWithChildren(linkNode);
    onChange(null, linkNode.getURL());
    return;
  }

  const url = linkNode.getURL();
  if (url !== match.url) {
    linkNode.setURL(match.url);
    onChange(match.url, url);
  }

  if (match.attributes) {
    const rel = linkNode.getRel();
    if (rel !== match.attributes.rel) {
      linkNode.setRel(match.attributes.rel || null);
      onChange(match.attributes.rel || null, rel);
    }

    const target = linkNode.getTarget();
    if (target !== match.attributes.target) {
      linkNode.setTarget(match.attributes.target || null);
      onChange(match.attributes.target || null, target);
    }
  }
}


const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const img = document.createElement('img');
img.src = TRANSPARENT_IMAGE;

export function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    }),
  );

  return true;
}

export function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

export function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    caption: SerializedEditor;
    height?: number;
    maxWidth: number;
    showCaption: boolean;
    src: string;
    width?: number;
  },
  SerializedLexicalNode
>;

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(
      src,
      altText,
      maxWidth,
      width,
      height,
      showCaption,
      caption,
      captionsEnabled,
      key,
    ),
  );
}

function isGoogleDocCheckboxImg(img: HTMLImageElement): boolean {
  return (
    img.parentElement != null &&
    img.parentElement.tagName === 'LI' &&
    img.previousSibling === null &&
    img.getAttribute('aria-roledescription') === 'checkbox'
  );
}

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
  const img = domNode as HTMLImageElement;
  if (img.src.startsWith('file:///') || isGoogleDocCheckboxImg(img)) {
    return null;
  }
  const { alt: altText, src, width, height } = img;
  const node = $createImageNode({ altText, height, src, width });
  return { node };
}

export class ImageNode extends DecoratorNode<Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: LexicalEditor;
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, src, showCaption } = serializedNode;
    return $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
    }).updateFromJSON(serializedNode);
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedImageNode>): this {
    const node = super.updateFromJSON(serializedNode);
    const { caption } = serializedNode;

    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
    this.__showCaption = showCaption || false;
    this.__caption =
      caption ||
      createEditor({
        nodes: [],
      });
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      width: this.__width === 'inherit' ? 0 : this.__width,
    };
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  // decorate(): JSX.Element {
  //   return (
  //     <Suspense fallback={null}>
  //       <ImageComponent
  //         src={this.__src}
  //         altText={this.__altText}
  //         width={this.__width}
  //         height={this.__height}
  //         maxWidth={this.__maxWidth}
  //         nodeKey={this.getKey()}
  //         showCaption={this.__showCaption}
  //         caption={this.__caption}
  //         captionsEnabled={this.__captionsEnabled}
  //         resizable={true}
  //       />
  //     </Suspense>
  //   );
  // }
}

export function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

export function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== 'image') {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

export function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    isHTMLElement(target) &&
    !target.closest('code, span.editor-image') &&
    isHTMLElement(target.parentElement) &&
    target.parentElement.closest('div.ContentEditable__root')
  );
}

export function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const domSelection = getDOMSelectionFromTarget(event.target);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}


const SUPPORTED_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'sms:',
  'tel:',
]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // eslint-disable-next-line no-script-url
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
  } catch {
    return url;
  }
  return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  // Maybe show a dialog where they user can type the URL before inserting it.
  return url === 'https://' || urlRegExp.test(url);
}

export function findMatchingDOM<T extends Node>(
  startNode: Node,
  predicate: (node: Node) => node is T,
): T | null {
  let node: Node | null = startNode;
  while (node != null) {
    if (predicate(node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> =
  createCommand('INSERT_HORIZONTAL_RULE_COMMAND');
