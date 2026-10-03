import type { ReactNode } from 'react'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { I18nextProvider } from 'react-i18next'

import type { AppResources } from '../../bootstrap.model'
import type { PageLink } from './components/page-header/page-header'
import type { Destination } from './components/shell-navigation/shell-navigation'
import { OfflineStatus } from '../../offline'
import { shellStyles } from './app-shell.styles'
import { ExitConfirmationDialog } from './components/exit-confirmation-dialog/exit-confirmation-dialog'
import { PageHeader } from './components/page-header/page-header'
import { ShellHeader } from './components/shell-header/shell-header'
import { ShellNavigation } from './components/shell-navigation/shell-navigation'
import { StorageFooter } from './components/storage-footer/storage-footer'

type AppShellProps = Readonly<{
  localization: AppResources['localization']
  offline: AppResources['offline']
  title: string
  isTitleHidden?: boolean
  isContentCentered?: boolean
  destinations: readonly Destination[]
  links: readonly PageLink[]
  children?: ReactNode
}>

export const AppShell = reatomComponent(
  ({
    localization,
    offline,
    title,
    destinations,
    links,
    children,
    isTitleHidden = false,
    isContentCentered = false,
  }: AppShellProps) => {
    const t = localization.t()

    return (
      <I18nextProvider i18n={localization.i18n}>
        <title>{`${title} · ${t('app.title')}`}</title>
        <a className={shellStyles.skip} href="#main">
          {t('navigation.skip')}
        </a>
        <Grid css={{ ...shellStyles.root }}>
          <div className={shellStyles.sidebar}>
            <ShellHeader brand={t('app.brand')} />
            <ShellNavigation label={t('navigation.main')} destinations={destinations} />
            <StorageFooter label={t(offline() === 'ready' ? 'offline.ready' : 'app.deviceLocal')} />
          </div>
          <Stack as="main" id="main" tabIndex={-1} css={{ ...shellStyles.main }}>
            <Stack css={{ ...shellStyles.content }} data-centered={isContentCentered || undefined}>
              <PageHeader title={title} links={links} isTitleHidden={isTitleHidden} />
              {offline() === 'error' || offline() === 'preparing' || offline.update() ? (
                <OfflineStatus offline={offline} localization={localization} />
              ) : null}
              {children}
            </Stack>
          </Stack>
        </Grid>
        <ExitConfirmationDialog localization={localization} />
      </I18nextProvider>
    )
  },
  'AppShell',
)
