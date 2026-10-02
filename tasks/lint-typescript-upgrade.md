# Lint and TypeScript upgrade repairs

## Plan

- [x] Run `yarn lint`, trace each failure, and fix its root cause.
- [x] Run `yarn ts:compile`, trace each failure, and fix its root cause.
- [x] Run `yarn format` exactly once, then verify the final checks and diff.

Keep all changes local and uncommitted.

## Findings

The initial lint command fails while loading Panda's plugin, before source linting.
Panda 2.0.0's default ESLint export contains configuration factories rather than the
`rules` object Oxlint expects. Its Oxlint integration must bind rules to the project's
Panda configuration, and the former v1 rule names must be migrated to the v2 rules.

The seven subsequent unsafe-assignment diagnostics share one cause: the interaction
recipe imports `SystemStyleObject` from `@pandacss/dev`, which no longer exports it.
Importing the configuration type from `@pandacss/types`, as the existing pattern
configuration does, restores type checking for the shared styles and their consumers.

The migrated configuration uses `createPandaPlugin` with an explicit design-system
working directory and config path, so root and workspace invocations bind the same
project. The supported v2 rules cover deprecations, extraction diagnostics, color
tokens, property spelling, and shorthand/longhand conflicts. Removed v1 rules and
their obsolete config-file exception are retired; existing restricted-import rules
continue to enforce recipe-factory boundaries.

TypeScript then reports the token gallery's raw `minChildWidth="10rem"`, because v2
generates strict size-token types for that pattern prop. A `swatch.min` geometry token
preserves its 160px / 10rem value in both skins without weakening strict token checks.

Both `yarn lint` and `yarn ts:compile` now pass. A temporary invalid-style probe also
confirms that root and web-workspace Oxlint runs report Panda token, logical-property,
and margin violations. The probe was removed after verification.

## Final verification

- `yarn format` ran exactly once and succeeded.
- Post-format `yarn lint`, `yarn ts:compile`, and `yarn format:check` all pass.
- `yarn test:storybook` builds successfully and passes all 18 browser tests.
- Built Storybook CSS contains the swatch size token at `10rem` for both skins and
  uses it in the gallery's auto-fit grid.
- `git diff --check` passes. All changes remain local and uncommitted.

Panda emits a non-failing runtime-binary fallback warning, and the Storybook build
retains its chunk-size warning. Neither is a lint or TypeScript diagnostic.
