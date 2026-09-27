# End-to-end tests

This private workspace owns Playwright BDD tests. All dependencies are declared at the
repository root; run the following commands there:

```sh
yarn browser:install
yarn test:e2e
yarn workspace @einbuergerungstest/e2e test:e2e:headed
yarn workspace @einbuergerungstest/e2e bddgen
yarn workspace @einbuergerungstest/e2e report
```

On Linux CI, use `yarn browser:install --with-deps` to install browser system
dependencies.

Put executable Gherkin in `features/**/*.feature` and step definitions in `steps/**/*.ts`.
Playwright's page and browser context are scenario-local fixtures. Add fixtures here when
a scenario needs additional external setup; do not import web implementation or state.

Both execution commands build the application, regenerate scenarios, and start Vite
preview at `http://127.0.0.1:4173`. The port must be free. Existing servers are never
reused, including locally, so tests exercise the current production build. BDD generation
fails on missing or ambiguous steps. CI rejects focused tests. Failures are not retried
automatically.

`.features-gen`, `test-results`, and `playwright-report` are disposable Git-ignored
output. The HTML report includes retained failure traces and screenshots. Root lint,
format and type checks include this workspace's authored steps and configuration.

Use accessible names for locators and observable outcomes for assertions. Keep component
visual states in the design system's Storybook tests and model logic in unit tests.
