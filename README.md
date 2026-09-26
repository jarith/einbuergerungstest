# Web application template

A React/Reatom application starter with Mantine and Panda, strict TypeScript, Yarn
workspaces, Oxlint/Oxfmt, Vitest, Storybook, and a separate Playwright BDD workspace.

## Start here

Use this repository as a GitHub template, then install the Node version in `.nvmrc`:

```sh
nvm install
nvm use
corepack enable
yarn install --immutable
yarn browser:install
yarn dev
```

Any Node version manager that reads `.nvmrc` works. Node 24 includes Corepack; Yarn's
exact version is pinned in `package.json`. On Linux, `yarn browser:install --with-deps`
also installs the browser's system dependencies.

The application runs at `http://127.0.0.1:5173`. Run `yarn storybook` in another terminal
for the component workbench at `http://localhost:6006`. Both commands generate Panda
assets before starting and watch styles during development. Stop the command to stop its
processes.

The counter is intentionally small and removable. Application logic stays in `web`,
browser acceptance tests in `e2e`, and reusable infrastructure in `packages/*`. All
dependencies are declared at the repository root. The generic `@app/*` package scope can
stay unchanged when you create a new application.

## Commands

Run these from the repository root:

| Command                                   | Purpose                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `yarn dev`                                | Develop the application with Vite and Panda watching                     |
| `yarn build`                              | Build the production application into `web/dist`                         |
| `yarn preview`                            | Serve an existing production build locally                               |
| `yarn storybook`                          | Develop component stories                                                |
| `yarn workspace @app/design-system build` | Build the static workbench                                               |
| `yarn typecheck`                          | Check all workspaces, tests, stories and configuration with TypeScript 7 |
| `yarn lint` / `yarn lint:fix`             | Type-aware Oxlint checks / fixes                                         |
| `yarn format:check` / `yarn format`       | Oxfmt checks / formatting                                                |
| `yarn test`                               | Unit, custom lint-rule and generator tests                               |
| `yarn test:browser`                       | React/Reatom browser integration tests                                   |
| `yarn test:storybook`                     | Build and test component stories with Playwright                         |
| `yarn test:e2e`                           | Build and test the complete app with Playwright BDD                      |
| `yarn check:static`                       | Type, lint and formatting checks                                         |
| `yarn check:all`                          | Static checks and every test layer, including production builds          |
| `yarn panda:prepare`                      | Regenerate ignored Panda utilities and CSS                               |
| `yarn browser:install`                    | Install the pinned Chromium browser                                      |
| `yarn create:package <name>`              | Create an infrastructure workspace                                       |

`preview` intentionally serves an existing build; run `build` first. Other documented
commands prepare their generated assets. Test servers require free ports: 4173 for E2E,
6006 for Storybook tests, and Vitest's browser-server port for component tests. Stop the
interactive Storybook process before running its Playwright suite.

Formatting follows Groove Forge: two spaces, single quotes, no semicolons, trailing
commas, and a 100-column limit (90 columns for Markdown). Oxfmt handles layout; Oxlint's
Stylistic rules enforce blank lines around multiline statements, declarations, and
standalone calls, with grouped assertions and re-exports kept together. Run
`yarn lint:fix` followed by `yarn format` to apply both sets of rules.

## Guides

- [Application structure and package creation](docs/architecture.md)
- [Mantine/Panda design system](packages/design-system/README.md)
- [Test ownership and CI](docs/testing.md)
- [Toolchain versions and dependency maintenance](docs/toolchain.md)
- [E2E workspace](e2e/README.md)
- [Extraction sources and intentional omissions](docs/extraction-sources.md)

GitHub Actions runs separate build, lint, `ts:compile`, format check, unit test, E2E
test, browser test, and Storybook test jobs on pull requests and pushes to `master`,
with manual runs also available. All eight jobs call
[the reusable check workflow](.github/workflows/run-check.yml), which uses Node from
`.nvmrc`, Yarn from `packageManager`, a shared package cache, and immutable dependency
installs. Jobs run independently with shallow checkouts, and newer runs cancel
superseded runs for the same pull request or branch. The E2E, browser, and Storybook
jobs install Chromium with its system dependencies. No jobs upload artifacts.

This template does not require credentials, databases, external services, or a deployment
provider.
