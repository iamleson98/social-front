/* eslint-disable no-useless-escape */

export const CellAlign = new RegExp(`(?i)^(center|justify|left|right|char)$`);
export const CellVerticalAlign = new RegExp(`(?i)^(baseline|bottom|middle|top)$`);
export const Direction = new RegExp(`(?i)^(rtl|ltr)$`);
export const ImageAlign = new RegExp(`(?i)^(left|right|top|texttop|middle|absmiddle|baseline|bottom|absbottom)$`);

// Integer describes whole positive integers (including 0) used in places
// like td.colspan
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attr-colspan
export const Integer = new RegExp(`^[0-9]+$`)

// ISO8601 according to the W3 group is only a subset of the ISO8601
// standard: http://www.w3.org/TR/NOTE-datetime
//
// Used in places like time.datetime
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time#attr-datetime
//
// Matches patterns:
//  Year:
//     YYYY (eg 1997)
//  Year and month:
//     YYYY-MM (eg 1997-07)
//  Complete date:
//     YYYY-MM-DD (eg 1997-07-16)
//  Complete date plus hours and minutes:
//     YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
//  Complete date plus hours, minutes and seconds:
//     YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
//  Complete date plus hours, minutes, seconds and a decimal fraction of a
//  second
//      YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
export const ISO8601 = new RegExp(`^[0-9]{4}(-[0-9]{2}(-[0-9]{2}([ T][0-9]{2}(:[0-9]{2}){1,2}(.[0-9]{1,6})?Z?([+-][0-9]{2}:[0-9]{2})?)?)?)?$`);

// ListType encapsulates the common value as well as the latest spec
// values for lists
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol#attr-type
export const ListType = new RegExp(`(?i)^(circle|disc|square|a|A|i|I|1)$`);

// SpaceSeparatedTokens is used in places like `a.rel` and the common attribute
// `class` which both contain space delimited lists of data tokens
// http://www.w3.org/TR/html-markup/datatypes.html#common.data.tokens-def
// Regexp: \p{L} matches unicode letters, \p{N} matches unicode numbers
export const SpaceSeparatedTokens = new RegExp(`^([\s\p{L}\p{N}_-]+)$`);

// Number is a double value used on HTML5 meter and progress elements
// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-button-element.html#the-meter-element
export const Number = new RegExp(`^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$`);

// NumberOrPercent is used predominantly as units of measurement in width
// and height attributes
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-height
export const NumberOrPercent = new RegExp(`^[0-9]+[%]?$`);

// Paragraph of text in an attribute such as *.'title', img.alt, etc
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-title
// Note that we are not allowing chars that could close tags like '>'
export const Paragraph = new RegExp(`^[\p{L}\p{N}\s\-_',\[\]!\./\\\(\)]*$`);

// dataURIImagePrefix is used by AllowDataURIImages to define the acceptable
// prefix of data URIs that contain common web image formats.
//
// This is not exported as it's not useful by itself, and only has value
// within the AllowDataURIImages func
export const dataURIImagePrefix = new RegExp(`^image/(gif|jpeg|png|svg\+xml|webp);base64,`);
