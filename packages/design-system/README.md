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
├── panda.config.cts                  # Pure configuration for all consumers
└── styled-system/                    # Generated and ignored; never edit
```

## Use it

```tsx
import { Button, ChoiceGroup, DesignSystemProvider, Panel } from '@app/design-system'
import '@app/design-system/styles.css'

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

Use `css`, `cx`, `cva`, `sva`, `token`, or the public layout helpers from the package
entry. Built-in examples are `stack`, `hstack`, `vstack`, `flex`, `grid`, `wrap`,
`container`, and `center`; `toolbar` shows how to add a custom pattern. Pattern calls
belong in colocated `.styles.ts` files. Component recipes and generated files are private.

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
yarn workspace @app/design-system build
yarn ts:compile
yarn workspace @app/design-system lint
yarn workspace @app/design-system format:check
yarn test:storybook
yarn test:browser
yarn test:e2e
```

`panda:prepare` runs `panda codegen` for helpers and types. The root PostCSS plugin emits
CSS during Vite and Storybook builds and watches sources during development. Both use the
same config and ignored `styled-system` directory. Do not delete generated helpers while a
dev server is using them. This follows Panda's
[Vite/PostCSS integration](https://panda-css.com/docs/installation/vite).

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
