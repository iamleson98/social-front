
/**
 * NOTE: This type is borrowed from leaflet for prop type enforcement
 */
export type DomUtil = {
  /**
   * Get Element by its ID or with the given HTML-Element
   */
  get(element: string | HTMLElement): HTMLElement | null;
  getStyle(el: HTMLElement, styleAttrib: string): string | null;
  /**
   * Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
   * @param tagName The name of the tag to create (for example: `div` or `canvas`).
   * @param className The class to set on the created element.
   * @param container The container to append the created element to.
   */
  create<T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    className?: string,
    container?: HTMLElement,
  ): HTMLElementTagNameMap[T];
  create(tagName: string, className?: string, container?: HTMLElement): HTMLElement;
  remove(el: HTMLElement): void;
  empty(el: HTMLElement): void;
  toFront(el: HTMLElement): void;
  toBack(el: HTMLElement): void;
  hasClass(el: HTMLElement, name: string): boolean;
  addClass(el: HTMLElement, name: string): void;
  removeClass(el: HTMLElement, name: string): void;
  setClass(el: HTMLElement, name: string): void;
  getClass(el: HTMLElement): string;
  setOpacity(el: HTMLElement, opacity: number): void;
  testProp(props: string[]): string | false;
  setTransform(el: HTMLElement, offset: Point, scale?: number): void;
  setPosition(el: HTMLElement, position: Point): void;
  getPosition(el: HTMLElement): Point;
  getScale(el: HTMLElement): { x: number; y: number; boundingClientRect: DOMRect };
  getSizedParentNode(el: HTMLElement): HTMLElement;
  disableTextSelection(): void;
  enableTextSelection(): void;
  disableImageDrag(): void;
  enableImageDrag(): void;
  preventOutline(el: HTMLElement): void;
  restoreOutline(): void;
};

/**
 * NOTE: This type is borrowed from leaflet for prop type enforcement
 */
export type Point = {
  clone(): Point;
  add(otherPoint: PointExpression): Point; // non-destructive, returns a new point
  subtract(otherPoint: PointExpression): Point;
  divideBy(num: number): Point;
  multiplyBy(num: number): Point;
  scaleBy(scale: PointExpression): Point;
  unscaleBy(scale: PointExpression): Point;
  round(): Point;
  floor(): Point;
  ceil(): Point;
  trunc(): Point;
  distanceTo(otherPoint: PointExpression): number;
  equals(otherPoint: PointExpression): boolean;
  contains(otherPoint: PointExpression): boolean;
  toString(): string;
  x: number;
  y: number;
};

export type PointTuple = [number, number];

export type PointExpression = Point | PointTuple;

export type LatLngExpression = LatLng | LatLngLiteral | LatLngTuple;

export interface LatLngLiteral {
  lat: number;
  lng: number;
  alt?: number;
}

export type LatLng = {
  equals(otherLatLng: LatLngExpression, maxMargin?: number): boolean;
  toString(): string;
  distanceTo(otherLatLng: LatLngExpression): number;
  wrap(): LatLng;
  toBounds(sizeInMeters: number): LatLngBounds;
  clone(): LatLng;

  lat: number;
  lng: number;
  alt?: number | undefined;
}

export type LatLngBounds = {
  extend(latlngOrBounds: LatLngExpression | LatLngBoundsExpression);
  pad(bufferRatio: number): LatLngBounds; // Returns a new LatLngBounds
  getCenter(): LatLng;
  getSouthWest(): LatLng;
  getNorthEast(): LatLng;
  getNorthWest(): LatLng;
  getSouthEast(): LatLng;
  getWest(): number;
  getSouth(): number;
  getEast(): number;
  getNorth(): number;
  contains(otherBoundsOrLatLng: LatLngBoundsExpression | LatLngExpression): boolean;
  intersects(otherBounds: LatLngBoundsExpression): boolean;
  overlaps(otherBounds: LatLngBoundsExpression): boolean;
  toBBoxString(): string;
  equals(otherBounds: LatLngBoundsExpression, maxMargin?: number): boolean;
  isValid(): boolean;
}

export interface LeafletEvent {
  type: string;
  popup: unknown;
  target: unknown;
  sourceTarget: unknown;
  propagatedFrom: unknown;
  /**
   * @deprecated The same as {@link LeafletEvent.propagatedFrom propagatedFrom}.
   */
  layer: unknown;
}

export interface LeafletMouseEvent extends LeafletEvent {
  latlng: LatLng;
  layerPoint: Point;
  containerPoint: Point;
  originalEvent: MouseEvent;
}

export interface LeafletKeyboardEvent extends LeafletEvent {
  originalEvent: KeyboardEvent;
}

export type LatLngTuple = [number, number, number?];

export type LatLngBoundsLiteral = LatLngTuple[]; // Must be [LatLngTuple, LatLngTuple], cant't change because Map.setMaxBounds

export type LatLngBoundsExpression = LatLngBounds | LatLngBoundsLiteral;


export interface LeafletEvent {
  type: string;
  popup: unknown;
  target: unknown;
  sourceTarget: unknown;
  propagatedFrom: unknown;
  /**
   * @deprecated The same as {@link LeafletEvent.propagatedFrom propagatedFrom}.
   */
  layer: unknown;
}

export interface LeafletMouseEvent extends LeafletEvent {
  latlng: LatLng;
  layerPoint: Point;
  containerPoint: Point;
  originalEvent: MouseEvent;
}

type EventHandlerFn = (event: Event) => void;

type PropagableEvent = LeafletMouseEvent | LeafletKeyboardEvent | LeafletEvent | Event;

export type DomEvent = {
  // on: (el: HTMLElement, types: string, fn: EventHandlerFn, context?: any) => void;

  on: (el: HTMLElement, eventMap: { [eventName: string]: EventHandlerFn }, context?: unknown) => void;

  // tslint:disable:unified-signatures
  // off: (el: HTMLElement) => void;

  // off = (el: HTMLElement, types: string, fn: EventHandlerFn, context?: any) => void;

  off: (el: HTMLElement, eventMap: { [eventName: string]: EventHandlerFn }, context?: unknown) => void;

  stopPropagation: (ev: PropagableEvent) => void;

  disableScrollPropagation: (el: HTMLElement) => void;

  disableClickPropagation: (el: HTMLElement) => void;

  preventDefault: (ev: Event) => void;

  stop: (ev: PropagableEvent) => void;

  getMousePosition: (ev: MouseEvent, container?: HTMLElement) => Point;

  getWheelDelta: (ev: Event) => number;

  // addListener: (el: HTMLElement, types: string, fn: EventHandlerFn, context?: any) => void;

  addListener: (
    el: HTMLElement,
    eventMap: { [eventName: string]: EventHandlerFn },
    context?: unknown,
  ) => void;

  // removeListener: (el: HTMLElement, types: string, fn: EventHandlerFn, context?: any) => void;

  removeListener: (
    el: HTMLElement,
    eventMap: { [eventName: string]: EventHandlerFn },
    context?: unknown,
  ) => void;

  getPropagationPath: (ev: Event) => HTMLElement[];
}

