export type SocialColor = 'dark' | 'gray' | 'red' | 'pink' | 'grape' | 'violet' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'green' | 'lime' | 'yellow' | 'orange';

export type SocialRadius = 'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-xl';

export type SocialSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** this object defines according tailwind background colors for standard color modes */
export const socialBackgroundColorsMap: Record<SocialColor, string> = {
  dark: 'bg-gray-900',
  gray: 'bg-gray-500',
  red: "bg-red-500",
  pink: "bg-pink-500",
  grape: "bg-purple-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  green: "bg-green-500",
  lime: "bg-lime-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
};

export const socialFontColorsMap: Record<SocialColor, string> = {
  dark: 'text-gray-900',
  gray: 'text-gray-500',
  red: "text-red-500",
  pink: "text-pink-500",
  grape: "text-purple-500",
  violet: "text-violet-500",
  indigo: "text-indigo-500",
  blue: "text-blue-500",
  cyan: "text-cyan-500",
  teal: "text-teal-500",
  green: "text-green-500",
  lime: "text-lime-500",
  yellow: "text-yellow-500",
  orange: "text-orange-500",
};
