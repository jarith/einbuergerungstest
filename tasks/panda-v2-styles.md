# Panda v2 stylesheet regression

## Plan

- [x] Reproduce the missing sidebar layout in a browser and inspect the `.pen` design.
- [x] Trace source scanning, extraction, and PostCSS emission against Panda 2.0.0.
- [x] Add a browser regression check and apply the smallest configuration fix.
- [x] Verify development, production, responsive layout, and project checks.

## Findings

Panda 2.0.0's PostCSS integration scans source files and passes them through
`applyChanges`, which checks whether each path matches the configured source globs. With
this project's absolute `include` globs, scanning finds only 65 web files and the
admission check rejects all of them. Tokens and static recipes still emit, but the
utilities layer is absent. `panda debug` parses files directly and can emit styles that
are missing from the actual PostCSS build, so codegen/debug success alone does not verify
this integration.

Using paths relative to the configured design-system working directory scans and accepts
all 123 non-story source files. Keep the explicit PostCSS `cwd` and verify the actual
browser layout when changing Panda integration.

## Verification

- `yarn workspace @einbuergerungstest/e2e test:e2e --grep 'Responsive application shell'`:
  both desktop and phone scenarios failed before the fix and passed afterward against the
  production build.
- Development browser: utilities load, the shell computes to a grid, and the sidebar and
  main-content offset both measure 236px, matching the `.pen` desktop geometry. Desktop
  and phone screenshots were visually inspected.
- `yarn test:storybook`: all 18 browser checks pass across baseline/alternate skins and
  light/dark themes, including layout, accessibility, and interactions.
- E2E TypeScript compilation, `yarn lint:ast-grep`, changed-file formatting, and
  `git diff --check` pass.

## Separate upgrade issues (resolved)

Repository-wide checks initially failed in files outside this styling fix:

- `yarn lint`: Oxlint cannot load `@pandacss/eslint-plugin` and throws
  `TypeError: Cannot convert undefined or null to object`. The v2 comparison chat
  identifies the new dedicated `/oxlint` entry point; lint migration remains to be done.
- `yarn ts:compile`: `SystemStyleObject` is no longer exported from `@pandacss/dev` in
  `src/recipes/interaction/interaction.recipe.ts`, and the generated strict size type
  rejects `minChildWidth="10rem"` in `src/foundation/stories/tokens/tokens.stories.tsx`.

These failures do not block Vite or Storybook builds or the browser verification above.

Resolved in the subsequent [lint and TypeScript repairs](lint-typescript-upgrade.md):
Panda lint rules now bind explicitly to the design-system project using the v2 API,
the style type comes from `@pandacss/types`, and the gallery uses a size token preserving
its original width. Repository lint and TypeScript compilation pass.
