# Web application template

A React/Reatom application starter with Mantine and Panda, strict TypeScript, Yarn
workspaces, Oxlint/Oxfmt, Vitest, Storybook, and a separate Playwright BDD workspace.

## Start here

Install [mise](https://mise.jdx.dev/installing-mise.html), then run these commands from
the repository root:

```sh
mise trust mise.toml
mise install --locked
mise exec -- yarn install --immutable
mise exec -- yarn browser:install
mise exec -- yarn dev
```

`mise.toml` and `mise.lock` select and lock Node, Yarn, actionlint, jq, and ShellCheck.
`yarn.lock` locks application dependencies. If mise is activated in your shell, you can
run `yarn` directly. On Linux, `mise exec -- yarn browser:install --with-deps` also
installs the browser's system dependencies.

To update a tool, change its version in `mise.toml`, regenerate `mise.lock` with
`mise lock --platform linux-x64,macos-arm64,macos-x64`, and verify with
`mise install --locked`. For Yarn, record the SHA-256 of the published `yarn.js` in each
platform entry of `mise.lock`; its Aqua recipe does not supply a checksum.

The application runs at `http://127.0.0.1:5173`. Run `yarn storybook` in another terminal
for the component workbench at `http://localhost:6006`. Both commands generate Panda
assets before starting and watch styles during development. Stop the command to stop its
processes.

The counter is intentionally small and removable. Application logic stays in `web`,
browser acceptance tests in `e2e`, and reusable infrastructure in `packages/*`. All
dependencies are declared at the repository root. Workspace packages use the
`@einbuergerungstest/*` scope.

## Commands

Run these from the repository root with mise activated, or prefix a command with
`mise exec --`:

| Command                                                  | Purpose                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `yarn dev`                                               | Develop the application with Vite and Panda watching                     |
| `yarn build`                                             | Build the production application into `web/dist`                         |
| `yarn workspace @einbuergerungstest/web preview`         | Serve an existing production build locally                               |
| `yarn storybook`                                         | Develop component stories                                                |
| `yarn workspace @einbuergerungstest/design-system build` | Build the static workbench                                               |
| `yarn ts:compile`                                        | Check all workspaces, tests, stories and configuration with TypeScript 7 |
| `yarn lint`                                              | Generate Panda helpers, then run Actionlint, ast-grep, and Oxlint        |
| `yarn lint:ast-grep`                                     | Run custom ast-grep rules in every workspace                             |
| `yarn format:check` / `yarn format`                      | Oxfmt checks / formatting                                                |
| `yarn test`                                              | Unit, custom lint-rule and generator tests                               |
| `yarn test:browser`                                      | React/Reatom browser integration tests                                   |
| `yarn test:storybook`                                    | Build and test component stories with Playwright                         |
| `yarn test:e2e`                                          | Build and test the complete app with Playwright BDD                      |
| `yarn panda:prepare`                                     | Regenerate ignored Panda utilities and CSS                               |
| `yarn browser:install`                                   | Install the pinned Chromium browser                                      |
| `yarn create:package <name>`                             | Create an infrastructure workspace                                       |

`preview` intentionally serves an existing build; run `build` first. Other documented
commands prepare their generated assets. Test servers require free ports: 4173 for E2E,
6006 for Storybook tests, and Vitest's browser-server port for component tests. Stop the
interactive Storybook process before running its Playwright suite.

Formatting follows Groove Forge: two spaces, single quotes, no semicolons, trailing
commas, and a 100-column limit (90 columns for Markdown). Oxfmt handles layout; Oxlint's
Stylistic rules enforce blank lines around multiline statements, declarations, and
standalone calls, with grouped assertions and re-exports kept together. Run `yarn lint` to
check the rules and `yarn format` to apply formatting.

## Guides

- [Application structure and package creation](docs/architecture.md)
- [Mantine/Panda design system](packages/design-system/README.md)
- [Test ownership and CI](docs/testing.md)
- [Toolchain versions and dependency maintenance](docs/toolchain.md)
- [E2E workspace](e2e/README.md)
- [Extraction sources and intentional omissions](docs/extraction-sources.md)

GitHub Actions runs separate build, lint, `ts:compile`, format check, unit test, E2E test,
browser test, and Storybook test jobs on pull requests and pushes to `master`, with manual
runs also available. All eight jobs call
[the reusable check workflow](.github/workflows/run-check.yml), which uses mise to install
Node and Yarn from the checked-in tool lockfile, a shared package cache, and immutable
dependency installs. `.mise-version` pins the mise CLI used by CI. Jobs run independently
with shallow checkouts, and newer runs cancel superseded runs for the same pull request or
branch. The E2E, browser, and Storybook jobs install Chromium with its system
dependencies. No jobs upload artifacts.

This template does not require credentials, databases, external services, or a deployment
provider.
