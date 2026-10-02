import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { BookOpen, ChartNoAxesColumn, ClipboardCheck, House, Settings } from 'lucide-react'

import type { AppRoutes } from '../../app.route'
import type { AppRoute } from '../../routing'
import { pageNotFound, RouteStatus } from '../../routing'
import { AppShell } from '../app-shell/app-shell'

type AppLayoutProps = Readonly<{
  route: Pick<AppRoute, 'loader' | 'outlet'>
  routes: AppRoutes
  title: Computed<string>
}>

export const AppLayout = reatomComponent(({ route, routes, title }: AppLayoutProps) => {
  void route.loader()

  const data = route.loader.data()
  const error = route.loader.error()

  if (!route.loader.ready() || data === undefined || error !== undefined) {
    return (
      <Container as="main" paddingBlock="layout.section">
        <RouteStatus
          error={error}
          retry={wrap(() => {
            void route.loader.retry()
          })}
        />
      </Container>
    )
  }
  const t = data.localization.t()
  const [page] = route.outlet()

  return (
    <AppShell
      localization={data.localization}
      title={title()}
      isTitleHidden={
        routes.dashboard.exact() ||
        routes.study.entry.exact() ||
        routes.study.study.exact() ||
        routes.groups.exact() ||
        routes.mock.entry.match() ||
        routes.testReview.exact()
      }
      destinations={[
        {
          label: t('navigation.home'),
          icon: House,
          active: routes.dashboard.exact(),
          href: routes.dashboard.path(),
        },
        {
          label: t('navigation.study'),
          icon: BookOpen,
          active: routes.study.entry.match(),
          href: routes.study.entry.path(),
        },
        {
          label: t('navigation.mockTest'),
          icon: ClipboardCheck,
          active: routes.mock.entry.match(),
          href: routes.mock.entry.path({ testId: undefined }),
        },
        {
          label: t('navigation.progress'),
          icon: ChartNoAxesColumn,
          active: routes.progress.match(),
          href: routes.progress.path(),
        },
        {
          label: t('navigation.settingsShort'),
          icon: Settings,
          active: routes.settings.match(),
          href: routes.settings.path(),
        },
      ]}
      links={[
        ...(routes.progress.exact()
          ? [{ label: t('navigation.questions'), href: routes.questions.path() }]
          : []),
      ]}
    >
      {page ?? <RouteStatus error={pageNotFound()} language={data.localization.language()} />}
    </AppShell>
  )
}, 'AppLayout')
import type { Computed } from '@reatom/core'
import { Container } from '@einbuergerungstest/design-system/jsx'
