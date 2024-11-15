import { writable } from 'svelte/store';

export const menuItems = [
  { id: 'table-of-contents', title: "Table of contents" },
  { id: 'project-structure', title: 'Project Structure' },
  { id: 'coding-conventions', title: 'Coding conventions' },
  { id: 'dependencies-management', title: 'Dependencies Management' },
  { id: 'how-to-use-common-libraries', title: 'How to use common libraries' },
  { id: 'bugs-and-feature-requests', title: 'Bugs and feature requests' },
  { id: 'contributing', title: 'Contributing' },
  { id: 'creators', title: 'Creators' },
];

function highlightText(content: string) {
  content = `<p class="text-white">${content}</p>`;
  content = content.replace(/\[([^\]]+)\]/g, '<span class="text-amber-700">[$1]</span>');
  content = content.replace(/<code>(.*?)<\/code>/g, '<code class="text-amber-700">$1</code>');

  return content;
}

let contentTableContent = `
  <p class="text-white">- [Project structure](#project-structure)<br/>
  - [Coding conventions](#coding-conventions)<br/>
  - [Dependencies Management](#dependencies-management)<br/>
  - [How to use common libraries](#how-to-use-common-libraries)<br/>
  - [Bugs and feature requests](#bugs-and-feature-requests)<br/>
  - [Contributing](#contributing)<br/>
  - [Creators](#creators)</p>
`;

let contentProjectStructure = `
  <p class="text-white">- <code class="text-amber-700">src/graphql</code> - graphql schema definitions <br/>
  - <code class="text-amber-700">src/lib</code> - common svelte components used by the web, utility functions, api call stores, translations. To import things from <code class="text-amber-700">src/lib</code> folder, simply <code class="text-amber-700">import {...} from "$lib/..."</code> <br/>
  - <code class="text-amber-700">src/routes</code> - contains pages of the project <br/>
  - <code class="text-amber-700">src/routes/auth</code> - Contains all the pages for authen/author (login, signup, request password reset, reset new password) <br/>
  - <code class="text-amber-700">src/routes/(app)</code> - Contains all the routes for project functionalities. like product details page, category details page, order details page, shopping cart. <br/>
  - <code class="text-amber-700">src/.env.example</code> - this file contains environment variables like api end point, caching, .... Development team members <strong>MUST</strong> make file <code class="text-amber-700">src/.env.example</code> with all the variables defined in <code class="text-amber-700">.env/.env.local</code> file, for the compiler to understand.</p>
`;

export const contentData: { [key: string]: any } = {
  'table-of-contents': highlightText(contentTableContent),
  'project-structure': highlightText(contentProjectStructure),
  'coding-conventions': 'Content for Coding conventions',
  'dependencies-management': 'Content for Dependencies Management',
  'how-to-use-common-libraries': 'Content for How to use common libraries',
  'bugs-and-feature-requests': 'Content for Bugs and feature requests',
  'contributing': 'Content for Contributing',
  'creators': 'Content for Creators',
};

export const selectedId = writable<string>('table-of-contents');
