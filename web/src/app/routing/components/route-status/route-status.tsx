import { Button, InlineNotice } from '@einbuergerungstest/design-system'

import { PendingNotice } from '../../../components/pending-notice/pending-notice'
import de from '../../../i18n/de.json'
import en from '../../../i18n/en.json'
import ru from '../../../i18n/ru.json'
import { getAppPath } from '../../../offline/app-mode'

type RouteStatusProps = Readonly<{
  language?: 'en' | 'de' | 'ru' | undefined
  error?: Error | undefined
  retry?: (() => void) | undefined
}>

export const RouteStatus = ({ error, retry, language = 'en' }: RouteStatusProps) => {
  const messages = { en, de, ru }[language]

  return (
    <InlineNotice
      intent={error === undefined ? 'info' : 'danger'}
      role={error === undefined ? 'status' : 'alert'}
    >
      {error === undefined ? (
        <PendingNotice
          message={messages.common.loading}
          longWaitMessage={messages.common.loadingSlow}
        >
          <Button onClick={() => location.reload()}>{messages.common.reload}</Button>
        </PendingNotice>
      ) : (
        <p>{error.name === 'PageNotFound' ? messages.errors.notFound : messages.errors.startup}</p>
      )}
      {error === undefined ? null : error.name === 'PageNotFound' ? (
        <a href={getAppPath('/dashboard')}>{messages.navigation.dashboard}</a>
      ) : (
        <Button onClick={retry}>{messages.common.retry}</Button>
      )}
    </InlineNotice>
  )
}
