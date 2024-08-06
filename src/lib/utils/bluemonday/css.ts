
// type handler = (value: string) => boolean;

// const defaultStyleHandlers: Record<string, handler> = {
//   "align-content": AlignContentHandler,
//   "align-items": AlignItemsHandler,
//   "align-self": AlignSelfHandler,
//   "all": AllHandler,
//   "animation": AnimationHandler,
//   "animation-delay": AnimationDelayHandler,
//   "animation-direction": AnimationDirectionHandler,
//   "animation-duration": AnimationDurationHandler,
//   "animation-fill-mode": AnimationFillModeHandler,
//   "animation-iteration-count": AnimationIterationCountHandler,
//   "animation-name": AnimationNameHandler,
//   "animation-play-state": AnimationPlayStateHandler,
//   "animation-timing-function": TimingFunctionHandler,
//   "backface-visibility": BackfaceVisibilityHandler,
//   "background": BackgroundHandler,
//   "background-attachment": BackgroundAttachmentHandler,
//   "background-blend-mode": BackgroundBlendModeHandler,
//   "background-clip": BackgroundClipHandler,
//   "background-color": ColorHandler,
//   "background-image": ImageHandler,
//   "background-origin": BackgroundOriginHandler,
//   "background-position": BackgroundPositionHandler,
//   "background-repeat": BackgroundRepeatHandler,
//   "background-size": BackgroundSizeHandler,
//   "border": BorderHandler,
//   "border-bottom": BorderSideHandler,
//   "border-bottom-color": ColorHandler,
//   "border-bottom-left-radius": BorderSideRadiusHandler,
//   "border-bottom-right-radius": BorderSideRadiusHandler,
//   "border-bottom-style": BorderSideStyleHandler,
//   "border-bottom-width": BorderSideWidthHandler,
//   "border-collapse": BorderCollapseHandler,
//   "border-color": ColorHandler,
//   "border-image": BorderImageHandler,
//   "border-image-outset": BorderImageOutsetHandler,
//   "border-image-repeat": BorderImageRepeatHandler,
//   "border-image-slice": BorderImageSliceHandler,
//   "border-image-source": ImageHandler,
//   "border-image-width": BorderImageWidthHandler,
//   "border-left": BorderSideHandler,
//   "border-left-color": ColorHandler,
//   "border-left-style": BorderSideStyleHandler,
//   "border-left-width": BorderSideWidthHandler,
//   "border-radius": BorderRadiusHandler,
//   "border-right": BorderSideHandler,
//   "border-right-color": ColorHandler,
//   "border-right-style": BorderSideStyleHandler,
//   "border-right-width": BorderSideWidthHandler,
//   "border-spacing": BorderSpacingHandler,
//   "border-style": BorderStyleHandler,
//   "border-top": BorderSideHandler,
//   "border-top-color": ColorHandler,
//   "border-top-left-radius": BorderSideRadiusHandler,
//   "border-top-right-radius": BorderSideRadiusHandler,
//   "border-top-style": BorderSideStyleHandler,
//   "border-top-width": BorderSideWidthHandler,
//   "border-width": BorderWidthHandler,
//   "bottom": SideHandler,
//   "box-decoration-break": BoxDecorationBreakHandler,
//   "box-shadow": BoxShadowHandler,
//   "box-sizing": BoxSizingHandler,
//   "break-after": BreakBeforeAfterHandler,
//   "break-before": BreakBeforeAfterHandler,
//   "break-inside": BreakInsideHandler,
//   "caption-side": CaptionSideHandler,
//   "caret-color": CaretColorHandler,
//   "clear": ClearHandler,
//   "clip": ClipHandler,
//   "color": ColorHandler,
//   "column-count": ColumnCountHandler,
//   "column-fill": ColumnFillHandler,
//   "column-gap": ColumnGapHandler,
//   "column-rule": ColumnRuleHandler,
//   "column-rule-color": ColorHandler,
//   "column-rule-style": BorderSideStyleHandler,
//   "column-rule-width": ColumnRuleWidthHandler,
//   "column-span": ColumnSpanHandler,
//   "column-width": ColumnWidthHandler,
//   "columns": ColumnsHandler,
//   "cursor": CursorHandler,
//   "direction": DirectionHandler,
//   "display": DisplayHandler,
//   "empty-cells": EmptyCellsHandler,
//   "filter": FilterHandler,
//   "flex": FlexHandler,
//   "flex-basis": FlexBasisHandler,
//   "flex-direction": FlexDirectionHandler,
//   "flex-flow": FlexFlowHandler,
//   "flex-grow": FlexGrowHandler,
//   "flex-shrink": FlexGrowHandler,
//   "flex-wrap": FlexWrapHandler,
//   "float": FloatHandler,
//   "font": FontHandler,
//   "font-family": FontFamilyHandler,
//   "font-kerning": FontKerningHandler,
//   "font-language-override": FontLanguageOverrideHandler,
//   "font-size": FontSizeHandler,
//   "font-size-adjust": FontSizeAdjustHandler,
//   "font-stretch": FontStretchHandler,
//   "font-style": FontStyleHandler,
//   "font-synthesis": FontSynthesisHandler,
//   "font-variant": FontVariantHandler,
//   "font-variant-caps": FontVariantCapsHandler,
//   "font-variant-position": FontVariantPositionHandler,
//   "font-weight": FontWeightHandler,
//   "grid": GridHandler,
//   "grid-area": GridAreaHandler,
//   "grid-auto-columns": GridAutoColumnsHandler,
//   "grid-auto-flow": GridAutoFlowHandler,
//   "grid-auto-rows": GridAutoColumnsHandler,
//   "grid-column": GridColumnHandler,
//   "grid-column-end": GridAxisStartEndHandler,
//   "grid-column-gap": LengthHandler,
//   "grid-column-start": GridAxisStartEndHandler,
//   "grid-gap": GridGapHandler,
//   "grid-row": GridRowHandler,
//   "grid-row-end": GridAxisStartEndHandler,
//   "grid-row-gap": LengthHandler,
//   "grid-row-start": GridAxisStartEndHandler,
//   "grid-template": GridTemplateHandler,
//   "grid-template-areas": GridTemplateAreasHandler,
//   "grid-template-columns": GridTemplateColumnsHandler,
//   "grid-template-rows": GridTemplateRowsHandler,
//   "hanging-punctuation": HangingPunctuationHandler,
//   "height": HeightHandler,
//   "hyphens": HyphensHandler,
//   "image-rendering": ImageRenderingHandler,
//   "isolation": IsolationHandler,
//   "justify-content": JustifyContentHandler,
//   "left": SideHandler,
//   "letter-spacing": LetterSpacingHandler,
//   "line-break": LineBreakHandler,
//   "line-height": LineHeightHandler,
//   "list-style": ListStyleHandler,
//   "list-style-image": ImageHandler,
//   "list-style-position": ListStylePositionHandler,
//   "list-style-type": ListStyleTypeHandler,
//   "margin": MarginHandler,
//   "margin-bottom": MarginSideHandler,
//   "margin-left": MarginSideHandler,
//   "margin-right": MarginSideHandler,
//   "margin-top": MarginSideHandler,
//   "max-height": MaxHeightWidthHandler,
//   "max-width": MaxHeightWidthHandler,
//   "min-height": MinHeightWidthHandler,
//   "min-width": MinHeightWidthHandler,
//   "mix-blend-mode": MixBlendModeHandler,
//   "object-fit": ObjectFitHandler,
//   "object-position": ObjectPositionHandler,
//   "opacity": OpacityHandler,
//   "order": OrderHandler,
//   "orphans": OrphansHandler,
//   "outline": OutlineHandler,
//   "outline-color": ColorHandler,
//   "outline-offset": OutlineOffsetHandler,
//   "outline-style": OutlineStyleHandler,
//   "outline-width": OutlineWidthHandler,
//   "overflow": OverflowHandler,
//   "overflow-wrap": OverflowWrapHandler,
//   "overflow-x": OverflowXYHandler,
//   "overflow-y": OverflowXYHandler,
//   "padding": PaddingHandler,
//   "padding-bottom": PaddingSideHandler,
//   "padding-left": PaddingSideHandler,
//   "padding-right": PaddingSideHandler,
//   "padding-top": PaddingSideHandler,
//   "page-break-after": PageBreakBeforeAfterHandler,
//   "page-break-before": PageBreakBeforeAfterHandler,
//   "page-break-inside": PageBreakInsideHandler,
//   "perspective": PerspectiveHandler,
//   "perspective-origin": PerspectiveOriginHandler,
//   "pointer-events": PointerEventsHandler,
//   "position": PositionHandler,
//   "quotes": QuotesHandler,
//   "resize": ResizeHandler,
//   "right": SideHandler,
//   "scroll-behavior": ScrollBehaviorHandler,
//   "tab-size": TabSizeHandler,
//   "table-layout": TableLayoutHandler,
//   "text-align": TextAlignHandler,
//   "text-align-last": TextAlignLastHandler,
//   "text-combine-upright": TextCombineUprightHandler,
//   "text-decoration": TextDecorationHandler,
//   "text-decoration-color": ColorHandler,
//   "text-decoration-line": TextDecorationLineHandler,
//   "text-decoration-style": TextDecorationStyleHandler,
//   "text-indent": TextIndentHandler,
//   "text-justify": TextJustifyHandler,
//   "text-orientation": TextOrientationHandler,
//   "text-overflow": TextOverflowHandler,
//   "text-shadow": TextShadowHandler,
//   "text-transform": TextTransformHandler,
//   "top": SideHandler,
//   "transform": TransformHandler,
//   "transform-origin": TransformOriginHandler,
//   "transform-style": TransformStyleHandler,
//   "transition": TransitionHandler,
//   "transition-delay": TransitionDelayHandler,
//   "transition-duration": TransitionDurationHandler,
//   "transition-property": TransitionPropertyHandler,
//   "transition-timing-function": TimingFunctionHandler,
//   "unicode-bidi": UnicodeBidiHandler,
//   "user-select": UserSelectHandler,
//   "vertical-align": VerticalAlignHandler,
//   "visibility": VisiblityHandler,
//   "white-space": WhiteSpaceHandler,
//   "widows": OrphansHandler,
//   "width": WidthHandler,
//   "word-break": WordBreakHandler,
//   "word-spacing": WordSpacingHandler,
//   "word-wrap": WordWrapHandler,
//   "writing-mode": WritingModeHandler,
//   "z-index": ZIndexHandler,
// };

// const colorValues = ["initial", "inherit", "aliceblue", "antiquewhite",
//   "aqua", "aquamarine", "azure", "beige", "bisque", "black",
//   "blanchedalmond", "blue", "blueviolet", "brown", "burlywood",
//   "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue",
//   "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod",
//   "darkgray", "darkgrey", "darkgreen", "darkkhaki", "darkmagenta",
//   "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
//   "darkseagreen", "darkslateblue", "darkslategrey", "darkslategray",
//   "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray",
//   "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
//   "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray",
//   "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred",
//   "indigo", "ivory", "khaki", "lavender", "lavenderblush",
//   "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
//   "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen",
//   "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
//   "lightslategray", "lightslategrey", "lightsteeelblue", "lightyellow",
//   "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
//   "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
//   "mediumslateblue", "mediumspringgreen", "mediumturquoise",
//   "mediumvioletred", "midnightblue", "mintcream", "mistyrose",
//   "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab",
//   "orange", "orangered", "orchid", "palegoldenrod", "palegreen",
//   "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru",
//   "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
//   "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown",
//   "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue",
//   "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan",
//   "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
//   "whitesmoke", "yellow", "yellowgreen"];

// const Alpha = new RegExp(`^[a-z]+$`)
// const Blur = new RegExp(`^blur\([0-9]+px\)$`)
// const BrightnessCont = new RegExp(`^(brightness|contrast)\([0-9]+\%\)$`)
// const Count = new RegExp(`^[0-9]+[\.]?[0-9]*$`)
// const CubicBezier = new RegExp(`^cubic-bezier\(([ ]*(0(.[0-9]+)?|1(.0)?),){3}[ ]*(0(.[0-9]+)?|1)\)$`)
// const Digits = new RegExp(`^digits [2-4]$`)
// const DropShadow = new RegExp(`drop-shadow\(([-]?[0-9]+px) ([-]?[0-9]+px)( [-]?[0-9]+px)?( ([-]?[0-9]+px))?`)
// const Font = new RegExp(`^('[a-z \-]+'|[a-z \-]+)$`)
// const Grayscale = new RegExp(`^grayscale\(([0-9]{1,2}|100)%\)$`)
// const GridTemplateAreas = new RegExp(`^['"]?[a-z ]+['"]?$`)
// const HexRGB = new RegExp(`^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$`)
// const HSL = new RegExp(`^hsl\([ ]*([012]?[0-9]{1,2}|3[0-5][0-9]|360),[ ]*([0-9]{0,2}|100)\%,[ ]*([0-9]{0,2}|100)\%\)$`)
// const HSLA = new RegExp(`^hsla\(([ ]*[012]?[0-9]{1,2}|3[0-5][0-9]|360),[ ]*([0-9]{0,2}|100)\%,[ ]*([0-9]{0,2}|100)\%,[ ]*(1|1\.0|0|(0\.[0-9]+))\)$`)
// const HueRotate = new RegExp(`^hue-rotate\(([12]?[0-9]{1,2}|3[0-5][0-9]|360)?\)$`)
// const Invert = new RegExp(`^invert\(([0-9]{1,2}|100)%\)$`)
// const Length = new RegExp(`^[\-]?([0-9]+|[0-9]*[\.][0-9]+)(%|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|deg|rad|turn)?$`)
// const Matrix = new RegExp(`^matrix\(([ ]*[0-9]+[\.]?[0-9]*,){5}([ ]*[0-9]+[\.]?[0-9]*)\)$`)
// const Matrix3D = new RegExp(`^matrix3d\(([ ]*[0-9]+[\.]?[0-9]*,){15}([ ]*[0-9]+[\.]?[0-9]*)\)$`)
// const NegTime = new RegExp(`^[\-]?[0-9]+[\.]?[0-9]*(s|ms)?$`)
// const Numeric = new RegExp(`^[0-9]+$`)
// const NumericDecimal = new RegExp(`^[0-9\.]+$`)
// const Opactiy = new RegExp(`^opacity\(([0-9]{1,2}|100)%\)$`)
// const Perspective = new RegExp(`perspective\(`)
// const Position = new RegExp(`^[\-]*[0-9]+[cm|mm|in|px|pt|pc\%]* [[\-]*[0-9]+[cm|mm|in|px|pt|pc\%]*]*$`)
// const Opacity = new RegExp(`^(0[.]?[0-9]*)|(1.0)$`)
// const QuotedAlpha = new RegExp(`^["'][a-z]+["']$`)
// const Quotes = new RegExp(`^([ ]*["'][\x{0022}\x{0027}\x{2039}\x{2039}\x{203A}\x{00AB}\x{00BB}\x{2018}\x{2019}\x{201C}-\x{201E}]["'] ["'][\x{0022}\x{0027}\x{2039}\x{2039}\x{203A}\x{00AB}\x{00BB}\x{2018}\x{2019}\x{201C}-\x{201E}]["'])+$`)
// const Rect = new RegExp(`^rect\([0-9]+px,[ ]*[0-9]+px,[ ]*[0-9]+px,[ ]*[0-9]+px\)$`)
// const RGB = new RegExp(`^rgb\(([ ]*((([0-9]{1,2}|100)\%)|(([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))),){2}([ ]*((([0-9]{1,2}|100)\%)|(([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))))\)$`)
// const RGBA = new RegExp(`^rgba\(([ ]*((([0-9]{1,2}|100)\%)|(([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))),){3}[ ]*(1(\.0)?|0|(0\.[0-9]+))\)$`)
// const Rotate = new RegExp(`^rotate(x|y|z)?\(([12]?|3[0-5][0-9]|360)\)$`)
// const Rotate3D = new RegExp(`^rotate3d\(([ ]?(1(\.0)?|0\.[0-9]+),){3}([12]?|3[0-5][0-9]|360)\)$`)
// const Saturate = new RegExp(`^saturate\([0-9]+%\)$`)
// const Sepia = new RegExp(`^sepia\(([0-9]{1,2}|100)%\)$`)
// const Skew = new RegExp(`skew(x|y)?\(`)
// const Span = new RegExp(`^span [0-9]+$`)
// const Steps = new RegExp(`^steps\([ ]*[0-9]+([ ]*,[ ]*(start|end)?)\)$`)
// const Time = new RegExp(`^[0-9]+[\.]?[0-9]*(s|ms)?$`)
// const TransitionProp = new RegExp(`^([a-zA-Z]+,[ ]?)*[a-zA-Z]+$`)
// const TranslateScale = new RegExp(`(translate|translate3d|translatex|translatey|translatez|scale|scale3d|scalex|scaley|scalez)\(`)
// const URLReg = new RegExp(`^url\([\"\']?((https|http)[a-z0-9\.\\/_:]+[\"\']?)\)$`)
// const ZIndex = new RegExp(`^[\-]?[0-9]+$`)


// const multiSplit = (value: string, ...seps: string[]) => {
//   let curArr = [value];
//   for (const sep of seps) {
//     const newArr = [];
//     for (const cur of curArr) {
//       newArr.push(...cur.split(sep));
//     }
//     curArr = newArr;
//   }
//   return curArr
// };

// const recursiveCheck = (value: string[], funcs: ((v: string) => boolean)[]): boolean => {
//   for (let i = 0; i < value.length; i++) {
//     const temp = value.slice(0, i + 1).join(" ");
//     for (const fn of funcs) {
//       if (fn(temp) && (value.slice(i + 1).length === 0 || recursiveCheck(value.slice(i + 1), funcs))) {
//         return true;
//       }
//     }
//   }

//   return false;
// };

// const in_ = (value: string[], arr: string[]): boolean => {
//   for (const v of value) {
//     let found = false;
//     for (const a of arr) {
//       if (v === a) {
//         found = true;
//       }
//     }
//     if (!found) {
//       return false;
//     }
//   }

//   return true;
// };

// function splitValues(value: string): string[] {
//   const values = value.split(",");
//   const newValues: string[] = [];
//   for (const strippedValue of values) {
//     newValues.push(strippedValue.trim().toLowerCase());
//   }
//   return newValues;
// }
