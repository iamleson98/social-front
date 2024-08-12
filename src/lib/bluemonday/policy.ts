
export class Policy {
  // Declares whether the maps have been initialized, used as a cheap check to
  // ensure that those using Policy{} directly won't cause nil pointer
  // exceptions
  private initialized: boolean = false;
  // If true then we add spaces when stripping tags, specifically the closing
  // tag is replaced by a space character.
  private addSpaces: boolean;
  // When true, add rel="nofollow" to HTML a, area, and link tags
  private requireNoFollow: boolean;
  // When true, add rel="nofollow" to HTML a, area, and link tags
  // Will add for href="http://foo"
  // Will skip for href="/foo" or href="foo"
  private requireNoFollowFullyQualifiedLinks: boolean;
  // When true, add rel="noreferrer" to HTML a, area, and link tags
  private requireNoReferrer: boolean;
  // When true, add rel="noreferrer" to HTML a, area, and link tags
  // Will add for href="http://foo"
  // Will skip for href="/foo" or href="foo"
  private requireNoReferrerFullyQualifiedLinks: boolean;
  // When true, add crossorigin="anonymous" to HTML audio, img, link, script, and video tags
  private requireCrossOriginAnonymous: boolean;
  // When true, add and filter sandbox attribute on iframe tags
  private requireSandboxOnIFrame: Record<string, boolean>;
  // When true add target="_blank" to fully qualified links
  // Will add for href="http://foo"
  // Will skip for href="/foo" or href="foo"
  private addTargetBlankToFullyQualifiedLinks: boolean;
  // When true, URLs must be parseable by "net/url" url.Parse()
  private requireParseableURLs: boolean;
  // When true, u, _ := url.Parse("url"); !u.IsAbs() is permitted
  private allowRelativeURLs: boolean;
  // When true, allow data attributes.
  private allowDataAttributes: boolean;
  // When true, allow comments.
  private allowComments: boolean;
  private elsAndAttrs: Record<string, Record<string, attrPolicy[]>>;
  /** the keys are actually string form of RegexEp  */
  private elsMatchingAndAttrs: Record<string, Record<string, attrPolicy[]>>;
  private globalAttrs: Record<string, attrPolicy[]>;
  private elsAndStyles: Record<string, Record<string, stylePolicy[]>>;
  /** keys are regex strings */
  private elsMatchingAndStyles: Record<string, Record<string, stylePolicy[]>>;
  private globalStyles: Record<string, stylePolicy[]>;
  private allowURLSchemes: Record<string, urlPolicy[]>;
  private allowURLSchemeRegexps: RegExp[];
  private srcRewriter: urlRewriter;
  private setOfElementsAllowedWithoutAttrs: Record<string, unknown>;
  private setOfElementsMatchingAllowedWithoutAttrs: RegExp[];
  private setOfElementsToSkipContent: Record<string, unknown>;
  private allowUnsafe: boolean;

  constructor() {
    this.addDefaultElementsWithoutAttrs();
    this.addDefaultSkipElementContent();
  }

  init() {
    if (!this.initialized) {
      this.elsAndAttrs = {};
      this.elsMatchingAndAttrs = {};
      this.globalAttrs = {};
      this.elsAndStyles = {};
      this.elsMatchingAndStyles = {};
      this.globalStyles = {};
      this.allowURLSchemes = {};
      this.allowURLSchemeRegexps = [];
      this.setOfElementsAllowedWithoutAttrs = {};
      this.setOfElementsToSkipContent = {};
      this.initialized = true;
    }
  }

  addDefaultElementsWithoutAttrs() {
    this.init();

    this.setOfElementsAllowedWithoutAttrs["abbr"] = {};
    this.setOfElementsAllowedWithoutAttrs["acronym"] = {};
    this.setOfElementsAllowedWithoutAttrs["address"] = {};
    this.setOfElementsAllowedWithoutAttrs["article"] = {};
    this.setOfElementsAllowedWithoutAttrs["aside"] = {};
    this.setOfElementsAllowedWithoutAttrs["audio"] = {};
    this.setOfElementsAllowedWithoutAttrs["b"] = {};
    this.setOfElementsAllowedWithoutAttrs["bdi"] = {};
    this.setOfElementsAllowedWithoutAttrs["blockquote"] = {};
    this.setOfElementsAllowedWithoutAttrs["body"] = {};
    this.setOfElementsAllowedWithoutAttrs["br"] = {};
    this.setOfElementsAllowedWithoutAttrs["button"] = {};
    this.setOfElementsAllowedWithoutAttrs["canvas"] = {};
    this.setOfElementsAllowedWithoutAttrs["caption"] = {};
    this.setOfElementsAllowedWithoutAttrs["center"] = {};
    this.setOfElementsAllowedWithoutAttrs["cite"] = {};
    this.setOfElementsAllowedWithoutAttrs["code"] = {};
    this.setOfElementsAllowedWithoutAttrs["col"] = {};
    this.setOfElementsAllowedWithoutAttrs["colgroup"] = {};
    this.setOfElementsAllowedWithoutAttrs["datalist"] = {};
    this.setOfElementsAllowedWithoutAttrs["dd"] = {};
    this.setOfElementsAllowedWithoutAttrs["del"] = {};
    this.setOfElementsAllowedWithoutAttrs["details"] = {};
    this.setOfElementsAllowedWithoutAttrs["dfn"] = {};
    this.setOfElementsAllowedWithoutAttrs["div"] = {};
    this.setOfElementsAllowedWithoutAttrs["dl"] = {};
    this.setOfElementsAllowedWithoutAttrs["dt"] = {};
    this.setOfElementsAllowedWithoutAttrs["em"] = {};
    this.setOfElementsAllowedWithoutAttrs["fieldset"] = {};
    this.setOfElementsAllowedWithoutAttrs["figcaption"] = {};
    this.setOfElementsAllowedWithoutAttrs["figure"] = {};
    this.setOfElementsAllowedWithoutAttrs["footer"] = {};
    this.setOfElementsAllowedWithoutAttrs["h1"] = {};
    this.setOfElementsAllowedWithoutAttrs["h2"] = {};
    this.setOfElementsAllowedWithoutAttrs["h3"] = {};
    this.setOfElementsAllowedWithoutAttrs["h4"] = {};
    this.setOfElementsAllowedWithoutAttrs["h5"] = {};
    this.setOfElementsAllowedWithoutAttrs["h6"] = {};
    this.setOfElementsAllowedWithoutAttrs["head"] = {};
    this.setOfElementsAllowedWithoutAttrs["header"] = {};
    this.setOfElementsAllowedWithoutAttrs["hgroup"] = {};
    this.setOfElementsAllowedWithoutAttrs["hr"] = {};
    this.setOfElementsAllowedWithoutAttrs["html"] = {};
    this.setOfElementsAllowedWithoutAttrs["i"] = {};
    this.setOfElementsAllowedWithoutAttrs["ins"] = {};
    this.setOfElementsAllowedWithoutAttrs["kbd"] = {};
    this.setOfElementsAllowedWithoutAttrs["li"] = {};
    this.setOfElementsAllowedWithoutAttrs["mark"] = {};
    this.setOfElementsAllowedWithoutAttrs["marquee"] = {};
    this.setOfElementsAllowedWithoutAttrs["nav"] = {};
    this.setOfElementsAllowedWithoutAttrs["ol"] = {};
    this.setOfElementsAllowedWithoutAttrs["optgroup"] = {};
    this.setOfElementsAllowedWithoutAttrs["option"] = {};
    this.setOfElementsAllowedWithoutAttrs["p"] = {};
    this.setOfElementsAllowedWithoutAttrs["picture"] = {};
    this.setOfElementsAllowedWithoutAttrs["pre"] = {};
    this.setOfElementsAllowedWithoutAttrs["q"] = {};
    this.setOfElementsAllowedWithoutAttrs["rp"] = {};
    this.setOfElementsAllowedWithoutAttrs["rt"] = {};
    this.setOfElementsAllowedWithoutAttrs["ruby"] = {};
    this.setOfElementsAllowedWithoutAttrs["s"] = {};
    this.setOfElementsAllowedWithoutAttrs["samp"] = {};
    this.setOfElementsAllowedWithoutAttrs["script"] = {};
    this.setOfElementsAllowedWithoutAttrs["section"] = {};
    this.setOfElementsAllowedWithoutAttrs["select"] = {};
    this.setOfElementsAllowedWithoutAttrs["small"] = {};
    this.setOfElementsAllowedWithoutAttrs["span"] = {};
    this.setOfElementsAllowedWithoutAttrs["strike"] = {};
    this.setOfElementsAllowedWithoutAttrs["strong"] = {};
    this.setOfElementsAllowedWithoutAttrs["style"] = {};
    this.setOfElementsAllowedWithoutAttrs["sub"] = {};
    this.setOfElementsAllowedWithoutAttrs["summary"] = {};
    this.setOfElementsAllowedWithoutAttrs["sup"] = {};
    this.setOfElementsAllowedWithoutAttrs["svg"] = {};
    this.setOfElementsAllowedWithoutAttrs["table"] = {};
    this.setOfElementsAllowedWithoutAttrs["tbody"] = {};
    this.setOfElementsAllowedWithoutAttrs["td"] = {};
    this.setOfElementsAllowedWithoutAttrs["textarea"] = {};
    this.setOfElementsAllowedWithoutAttrs["tfoot"] = {};
    this.setOfElementsAllowedWithoutAttrs["th"] = {};
    this.setOfElementsAllowedWithoutAttrs["thead"] = {};
    this.setOfElementsAllowedWithoutAttrs["title"] = {};
    this.setOfElementsAllowedWithoutAttrs["time"] = {};
    this.setOfElementsAllowedWithoutAttrs["tr"] = {};
    this.setOfElementsAllowedWithoutAttrs["tt"] = {};
    this.setOfElementsAllowedWithoutAttrs["u"] = {};
    this.setOfElementsAllowedWithoutAttrs["ul"] = {};
    this.setOfElementsAllowedWithoutAttrs["var"] = {};
    this.setOfElementsAllowedWithoutAttrs["video"] = {};
    this.setOfElementsAllowedWithoutAttrs["wbr"] = {};
  }

  addDefaultSkipElementContent() {
    this.init();

    this.setOfElementsToSkipContent["frame"] = {};
    this.setOfElementsToSkipContent["frameset"] = {};
    this.setOfElementsToSkipContent["iframe"] = {};
    this.setOfElementsToSkipContent["noembed"] = {};
    this.setOfElementsToSkipContent["noframes"] = {};
    this.setOfElementsToSkipContent["noscript"] = {};
    this.setOfElementsToSkipContent["nostyle"] = {};
    this.setOfElementsToSkipContent["object"] = {};
    this.setOfElementsToSkipContent["script"] = {};
    this.setOfElementsToSkipContent["style"] = {};
    this.setOfElementsToSkipContent["title"] = {};
  }

  setAllowUnsafe(value: boolean): Policy {
    this.init();
    this.allowUnsafe = value;
    return this;
  }

  allowElementsContent(...names: string[]): Policy {
    this.init();

    for (const name of names) {
      delete this.setOfElementsToSkipContent[name.toLowerCase()];
    }

    return this;
  }

  skipElementsContent(...names: string[]): Policy {
    this.init();

    for (let name of names) {
      name = name.toLowerCase();
      if (this.setOfElementsToSkipContent[name] === undefined) {
        this.setOfElementsToSkipContent[name] = {};
      }
    }

    return this;
  }

  addSpaceWhenStrippingTag(allow: boolean): Policy {
    this.addSpaces = allow;
    return this;
  }
};


type attrPolicy = {
  regexp: RegExp;
};

type stylePolicy = {
  handler: (value: string) => boolean;
  regexp: RegExp;
  enum: string[];
};

type urlPolicy = (url: URL) => boolean;

type urlRewriter = (url: URL) => void;

class attrPolicyBuilder {
  private p: Policy;
  private attrNames: string[];
  private regexp: RegExp;
  private allowEmpty: boolean;
}

class stylePolicyBuilder {
  private p: Policy;
  private propertyNames: string[];
  private regexp: RegExp;
  private enum: string[];
  private handler: (value: string) => boolean;
}

type SandboxValue = number;

export enum SandBoxValues {
  SandboxAllowDownloads = 0 as SandboxValue,
  SandboxAllowDownloadsWithoutUserActivation = 1 as SandboxValue,
  SandboxAllowForms = 2 as SandboxValue,
  SandboxAllowModals = 3 as SandboxValue,
  SandboxAllowOrientationLock = 4 as SandboxValue,
  SandboxAllowPointerLock = 5 as SandboxValue,
  SandboxAllowPopups = 6 as SandboxValue,
  SandboxAllowPopupsToEscapeSandbox = 7 as SandboxValue,
  SandboxAllowPresentation = 8 as SandboxValue,
  SandboxAllowSameOrigin = 9 as SandboxValue,
  SandboxAllowScripts = 10 as SandboxValue,
  SandboxAllowStorageAccessByUserActivation = 11 as SandboxValue,
  SandboxAllowTopNavigation = 12 as SandboxValue,
  SandboxAllowTopNavigationByUserActivation = 13 as SandboxValue,
}
