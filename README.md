<p align="center">
  <a href="http://localhost:5173/">
    <img src="./static/logo.png" alt="Logo" width=auto height=50>
  </a>

  <p align="center">
    Sitename front end is a web interface for online shopping, focusing on giving best value and gain back trusts.
    <br>
  </p>
</p>

<hr />

<h3>I) DEVELOPMENT DOC</h3>

# NOTE: every conventions, specifications below are for a better developer yourself.
If you have any idea or contributions, do research first then tell me advantages and drawbacks of your solutions.
If you have good ideas and I find that hepful, there will be $ money award.
- potentional bug: 50k
- Small helpful idea: 50k
- Big idea - 100k


## Table of contents

- [Project structure](#project-structure)
- [Coding conventions](#coding-conventions)
- [Dependencies Management](#dependencies-management)
- [How to use common libraries](#how-to-use-common-libraries)
- [Bugs and feature requests](#bugs-and-feature-requests)
- [Contributing](#contributing)
- [Creators](#creators)


## Project structure

Below is a brief on project files/folder structure

- `src/lib` - common svelte components used by the web, utility functions, api call stores, translations. To import things from `src/lib` folder, simply `import {...} from '$lib/...'`
- `src/routes` - contains pages of the project
- `src/routes/auth` - Contains all the pages for authen/author (login, signup, request password reset, reset new password)
- `src/routes/(app)` - Contains all the routes for project functionalities. like product details page, category details page, order details page, shopping cart.
- `src/.env.example` - this file contains environment variables like api end point, cahing, .... Development team members `MUST` make file `src/.env.example` with all the variables defined in `.env/.env.local` file, for the compiler to uderstand.

### NOTE: If you have any confusion or question, directly ask (iamleson98) for more.

## Coding conventions
- For js code always try to use `typescript` whenever possible. This helps you to be good developer.
- `importing` - import `$lib/...` for library, custom component import
- Consider to export functions, consts, in the `index.ts` file of folder. This helps reduce typing efforts when importing.
- use tabs with 2 white spaces for indentation, both `js/html/css`
- Always try to find component style class in daisyui first, if not available, use tailwind css classes if possible. If not available also, create your own css, classes in the `<style>` section. This helps the project code smaller and increase performance.
- Function names MUST be in `camelCase` only.
- Constant names is RECOMMENDED to be in `UPPER_SNAKE_CASE`.
- Always apply the rule `Don't repeat yourself (DRY)` by making reusable code, when possible.
- Note: @iamleson98 is responsible for those conventions, make sure to follow them, otherwise there won't be code merge, and of couse critisim will happens.

## Dependencies Management

There are 2 types of dependencies
- `devDependencies` - all the 3rd libraries needed for development purpose, will not be compiled in production build.
Developers must use `pnpm/npm install -D ...` to install those libs. For example: `tailwindcss`, `postcss`
- `dependencies` - Those libs will be compiled for production use. Developers must use `pnpm/npm install ...` to install those dependencies.

### NOTE: BEFORE TRYING TO INSTALL A DEPENDENCY, ALL DEVELOPERS MUST ASK THE PROJECT MANAGER (@iamleson98) for consultation.

## How to use common libraries

- `Icons`: - ALWAYS look up icon by going to `/icons` folder irst. <br/>
           - If not found, go to this website: https://icon-sets.iconify.design/tabler/ then find your desired icon there. <br/>
           - If you still can't find your icon, you can find for it using universal icon lookup from given website. <br />
           - When you found your icon, copy its svg source, then create a new icon file in `/icons` folder <br/>
           - File naming as follow: <br />

           <icon_lib_name>--<icon_name>.svelte

           If your icon is from `tabler`, and the icon name is `home`, the file name should be: tabler--home.svelte

- `Common components` - For example `Button`, `Loading` component is already created in the `lib/ui` folder. Since Daisyui's buttons don't satisfy this project requirements, so I developed some specific components.
- `Daisyui` - daisyui is already installed. https://v5.daisyui.com/docs/v5-beta/ . `ALWAYS` refer to this document for available components first before trying to create your own component.
Since it helps reduce the number of tailwind css utility classes used in the code -> maintainability ++, productivity ++.
- NOTE: For example if you want to use specific component from daisy, you have to enable that component in `src/app.css`

## Bugs and feature requests

### After branch `master` has new merge, developer must rebase master to their own branch using command
```bash
# For example your working branch is <your_branch_name>
# 1) stash changes (if there are not stagged changes)
# 2) run this command
git rebase master
# 3) perform rebase the code, resolve conflicts (if have).
# 4) pop stash changes (If have, from step 1)
# 5) add your changes if needed
# 6) commit code. (NOTE: if git does not allow to push, add flag -f to FORCE push)
# E.g
git push -u origin <your_branch_name> -f
# 7) Create new pull request
```

### NOTE: Never merge code yourself before being accepted by (@iamleson98).


## Contributing

If you are invited to be a contributor:
- If you have any question or detect a problem, quote the line of code url, and create an issue. Remember to tag me (@iamleson98) or (@phuczk)
- If you want to contribute code, please create pull requests like described in section [Bugs and feature requests](#bugs-and-feature-requests)

Moreover, all HTML and CSS should conform to the [Code Guide](https://github.com/mdo/code-guide), maintained by [Main author](https://github.com/usernamemainauthor).

Editor preferences are available in the [editor config](https://reponame/blob/master/.editorconfig) for easy use in common text editors. Read more and download plugins at <https://editorconfig.org/>.

## Creators

@iamleson98 is core maintainer
@phuczk is co-founder, contributor
