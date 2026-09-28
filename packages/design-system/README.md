# Design system

This package follows Groove Forge's design-system structure. The baseline theme comes from
[`einbuergerungstest.pen`](../../einbuergerungstest.pen): Mantine provides controls and
interaction, while Panda owns the color roles, geometry, recipes, and layout. See
[the design mapping](DESIGN_MAPPING.md) for the extracted primitive inventory and source
evidence. The existing alternate skin remains an optional token-only example.

## Structure

```text
packages/design-system/
├── .storybook/                       # Shared provider, stylesheet, and theme toolbar
├── src/
│   ├── components/                   # Public Mantine-backed primitives
│   │   ├── button/                   # Render, recipe, styles, and stories together
│   │   ├── choice-group/
│   │   ├── dialog/
│   │   ├── navigation-item/
│   │   └── ...                       # Fields, status, progress, and separators
│   ├── design-system-provider/       # One visual root per document
│   ├── foundation/
│   │   ├── mantine/                  # CSS-variable adapters and wrapper prop types
│   │   ├── panda/                    # Theme projection, patterns, recipe registry
│   │   └── stories/
│   │       ├── components/           # Composition examples
│   │       ├── layout/               # Layout examples
│   │       └── tokens/               # Token role examples
│   ├── recipes/                      # Private recipes shared by components
│   │   ├── field/
│   │   ├── input/
│   │   └── interaction/
│   ├── tokens/                       # Authoritative values, semantics, and skins
│   ├── index.ts                      # Public API
│   └── styles.css                    # Public stylesheet and layer order
├── test/                             # Storybook browser and accessibility checks
├── panda.config.ts                   # Pure configuration for all consumers
└── styled-system/                    # Generated and ignored; never edit
```

## Use it

```tsx
import {
  Button,
  ChoiceGroup,
  DesignSystemProvider,
  Panel,
} from '@einbuergerungstest/design-system'
import '@einbuergerungstest/design-system/styles.css'

const Example = () => (
  <DesignSystemProvider colorScheme="light" skin="baseline">
    <Panel aria-label="Study question">
      <ChoiceGroup
        label="Which right does the Basic Law protect?"
        options={[
          { value: 'a', marker: 'A', label: 'Freedom of religion' },
          { value: 'b', marker: 'B', label: 'Freedom of speech' },
        ]}
      />
      <Button appearance="solid">Next question</Button>
    </Panel>
  </DesignSystemProvider>
)
```

The public primitives include actions, fields, answer choices, filters, navigation,
statuses, progress, notices, dividers, and dialogs. Native attributes and behavior props
remain available. Mantine visual props such as `color`, `variant`, `size`, `radius`,
`classNames`, and `vars` stay private. `className` and `style` remain deliberate escape
hatches.

`NavigationItem` requires an `href` and renders a native link. Use route-generated
destinations in the application so ordinary clicks can be guarded while new-tab and
link-copy behavior remains native. Disabled items expose `aria-disabled`, have no
destination, and are removed from sequential keyboard navigation.

Import layout primitives from `@einbuergerungstest/design-system/jsx` and styling helpers
from the package entry. Prefer `Grid`/`GridItem`, `Stack`, `HStack`, `VStack`, `Flex`,
`Wrap`, `Container`, `Center`, or the custom `Toolbar` for layout; use `Box` when no
specific layout fits. These generated Panda components use the same configured patterns
and defaults as the function helpers. Preserve semantic elements with `as`, for example
`<Container as="main">...</Container>`, without adding a wrapper.

Simple static layout props can live directly in JSX. Keep substantial styles and pattern
function calls in colocated `.styles.ts` files; use `css.raw()` for extractable objects
consumed through a primitive's `css` prop. Spread imported style objects into that prop
(`css={{ ...styles.content }}`) to preserve merging with pattern defaults while avoiding
the Panda lint plugin's false positives on imported object members. Keep finite visual
variants in `.recipe.ts` files. Existing semantic components still take priority,
including this package's `Divider`.

The `css`, `cx`, `cva`, `sva`, `token`, `stack`, `hstack`, `vstack`, `flex`, `grid`,
`wrap`, `container`, `center`, and `toolbar` helpers remain available for local styles and
components that need classes. Component recipes and generated files are private.

The root `oxlint.config.ts` loads the Panda and Storybook plugins. Panda's config path is
absolute so every workspace resolves the same tokens. Generated modules and private
package subpaths are blocked outside the design system; recipe factories belong in
`.recipe.ts` files. An explicit list exempts only configuration modules imported by
`panda.config.ts` from `no-config-function-in-source`.

Panda rules prefer full property names, logical properties, composite declarations, and
parent-owned spacing. Native text margins are reset once in the global styles. The
previous Panda plugin 0.3.2 did not match the former absolute source globs correctly, so
`file-not-included` remains disabled; this also limited `no-config-function-in-source`.
`prefer-shorthand-properties` and `prefer-atomic-properties` are disabled in favor of
their opposites. A documented inline exception covers the provider's `colorScheme` state,
which the plugin mistakes for styling. Shell styles also document narrow
composite-property exceptions where strict tokens cannot express two-value inset or
padding declarations without resetting the opposite edge. Safe-area padding tokens are
derived from both themes' geometry because Panda cannot resolve the existing flat dotted
token keys in token-to-token references.

Mount one provider per document and import the public stylesheet once. Mantine controls
`data-mantine-color-scheme`; the provider controls the independent `data-ds-theme` root
attribute. Both reach portaled content. Change provider props without a theme-dependent
React key to preserve mounted component state. Use separate documents for simultaneous
theme previews. The template's application continues to own its Reatom state scope.

## Customize and extend

1. Edit `tokens/colors.ts` and `tokens/tokens.ts` for source values. Inter Variable is
   self-hosted by the package stylesheet. Spacing and font sizes are design pixels:
   `spacing.4` means four pixels, not a framework scale index.
2. Add role aliases and shared control geometry in `tokens/semantics.ts`. Keep foreground
   and background roles paired, and check both color schemes when changing them.
3. Edit `tokens/themes.ts` for skins. `DesignTheme` requires the same categories and keys
   while permitting different values. The baseline is the `.pen` design; the pre-existing
   alternate example changes accent, font, radius, and control height through tokens.
4. `foundation/panda/panda-theme.ts` projects dimensions to rem once, keeps strokes in
   pixels, and emits text/layer styles and conditional CSS variables. Add media thresholds
   to Panda configuration only when your application needs them; the default token and
   breakpoint preset is intentionally absent.
5. Mantine adapters in `foundation/mantine/` reference Panda's generated `token.var()`
   values. Do not create another literal theme table. The shared `Input.extend({ vars })`
   adapter binds Mantine's public input height so sections follow the same field geometry.
6. Add a component folder with its render module, `.styles.ts`, `.recipe.ts` if needed,
   and stories. Register config recipes in `foundation/panda/recipes.ts`, then export only
   the component and its public props from `src/index.ts`. Add reusable private recipes
   under `src/recipes` when multiple components need them.

Keep product features, routing, and state outside this package. Add further token
categories and components only when there is a consumer.

## Generation and verification

From the repository root:

```sh
yarn dev
yarn storybook
yarn build
yarn workspace @einbuergerungstest/design-system build
yarn ts:compile
yarn workspace @einbuergerungstest/design-system lint
yarn workspace @einbuergerungstest/design-system format:check
yarn test:storybook
yarn test:browser
yarn test:e2e
```

`panda:prepare` runs `panda codegen` for helpers, React primitives, and types.
`jsxFramework: 'react'` enables JSX extraction, and `importMap.jsx` recognizes primitive
imports through the public `/jsx` entry. The root PostCSS plugin emits CSS during Vite and
Storybook builds and watches sources during development. Both use the same config and
ignored `styled-system` directory. Do not delete generated helpers while a dev server is
using them. This follows Panda's
[Vite/PostCSS integration](https://panda-css.com/docs/installation/vite).

Keep `include` globs relative to the design-system directory, which is the explicit `cwd`
for both PostCSS and CLI generation. With Panda 2.0.0, absolute globs can scan files but
reject them during PostCSS source admission, silently omitting utility CSS. Verify the
built application with the responsive shell scenarios in `e2e/features/shell.feature`;
successful helper generation or `panda debug` output alone does not catch this failure.

App extraction excludes stories and `*.stories.styles.ts`. Storybook scripts set
`PANDA_INCLUDE_STORIES=true` to include them. All registered recipe variants are emitted
in both builds so runtime `appearance` props do not depend on stories being scanned. The
config imports only tokens and recipe definitions, never React render modules or generated
helpers.

Mantine owns the reset; Panda preflight is disabled. The public stylesheet establishes
`mantine, reset, base, tokens, recipes, utilities` before importing Mantine's layered CSS.
Panda emits global typography and focus rules into `base`, component rules into `recipes`,
and composition styles into `utilities`. Avoid unlayered overrides.

Storybook includes token, layout, and composition examples alongside component stories.
Its Theme and Skin controls cover light/dark and baseline/alternate. Browser checks verify
computed colors and geometry, keyboard focus, accessible labels/errors, and axe checks
across all four combinations. The app's existing tests cover counter behavior and
preserving state when the color scheme changes.
