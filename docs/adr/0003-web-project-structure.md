# Organize the web application by pages and domain modules

Status: Accepted

## Context

The [requirements](../requirements.md), [glossary](../CONTEXT.md), and
[design](../../einbuergerungstest.pen) describe dashboard, study, mock-test, progress,
settings, and installation flows. They share a question bank and device-local learner
state, while each screen has its own presentation and interaction details. A page or route
does not by itself define a DDD bounded context. DDD calls for cohesive modules with names
from the domain language; fractal frontend organization keeps each screen's components and
their subcomponents with their owner. See the
[DDD reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf),
[bounded-context explanation](https://martinfowler.com/bliki/BoundedContext.html), and
[original fractal React description](https://hackernoon.com/fractal-a-react-app-structure-for-infinite-scale-4dab943092af).

## Decision

Treat Berlin test preparation as one initial bounded context. Organize reusable business
behavior under `web/src/modules/`, beginning with `question-bank`, `learner-state`, and
`mock-test`. These are cohesive modules, not separate bounded contexts. Inside a module,
separate pure domain rules from application state and browser infrastructure when those
responsibilities exist. Put cross-page question presentation with the question-bank
module. Keep generic visual primitives in `packages/design-system`.

Reserve this structure under `web/src/`:

```text
app/
  components/app-shell/
  i18n/
  offline/
modules/
  question-bank/
    domain/  application/  infrastructure/
    components/question-content/  components/question-image/
  learner-state/
    domain/  application/  infrastructure/
  mock-test/
    domain/  application/
pages/
  <page>/
    components/<page>-page/components/
    lib/
shared/
  navigation/
```

Place every page in its own folder directly under `web/src/pages/`:

```text
dashboard/       study/           study-groups/    mock-test/
test-review/     progress/        question-list/   question-history/
settings/        installation/
```

All-question and group study use the `study` page. Completed and unfinished mock-test
reviews use `test-review`. Feedback, study completion, image zoom, import preview, reset
confirmation, and device-size variants are states or components of these pages rather than
additional pages.

Every page folder has a `components/` folder containing its page component and all React
components specific to that page. Repeat this structure inside a complex component:
`components/<name>/<name>.tsx` may own its own `components/` folder. Put page-local state
in `<page>.model.ts` and page-local pure helpers in `lib/` when needed. Optional files and
subfolders are created when implementation needs them; the initial directory skeleton is
tracked by `.gitkeep` files. The page's `index.ts` is its public interface, and
`<page>.route.ts` defines its route.

The application root under `web/src/app/` composes the page routes, responsive shell, UI
localization, and offline lifecycle. `web/src/shared/` holds only small,
domain-independent code with multiple consumers, such as route path builders. The authored
bank and images stay in `web/public/`, which Vite serves directly. Build-time resource
tooling, if needed, belongs in `web/scripts/`.

Pages must never import another page, including a page's internal component. They navigate
through shared route paths and obtain reusable behavior through module public interfaces.
`app` may import page public interfaces to compose routes. Keep domain rules independent
of React, Reatom, IndexedDB, and UI translation libraries. Promote page-local code to a
shared module only after it has a second consumer or a genuine cross-page responsibility.

## Consequences

The structure keeps page implementations self-contained while one domain rule can serve
dashboard, study, test, and progress views. The page template can grow recursively without
requiring empty implementation layers. Import rules should be enforced for the actual
`web/src` path during implementation. The
[open group-study decisions](../open-decisions.md) change behavior inside the study flow
without changing these folder boundaries. This ADR records folder ownership; it does not
change the storage and localization choices still described as proposed in
[ADR 0002](./0002-offline-question-bank-and-localization.md).
