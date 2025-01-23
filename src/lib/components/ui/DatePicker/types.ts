type RuleToken = {
  id: string
  allowedValues?: string[]
  toString: (d: Date) => string
}

export type FormatToken = string | RuleToken

export type ParseResult = {
  date: Date | null
  missingPunctuation: string
}

export type Locale = {
  weekdays?: string[]
  months?: string[]
  shortMonths?: string[]
  weekStartsOn?: number
}

export type InnerLocale = {
  weekdays: string[]
  months: string[]
  shortMonths: string[]
  weekStartsOn: number
}
