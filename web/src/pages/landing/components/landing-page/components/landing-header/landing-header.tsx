import { Flex } from '@einbuergerungstest/design-system/jsx'

import type { getLandingContent } from '../../../../landing-content'
import { styles } from '../../landing-page.styles'

type LandingHeaderProps = Readonly<{
  language: 'de' | 'en'
  content: ReturnType<typeof getLandingContent>
}>

export const LandingHeader = ({ language, content }: LandingHeaderProps) => (
  <Flex as="header" css={{ ...styles.header }}>
    <a className={styles.brand} href={language === 'de' ? '/' : '/en/'}>
      Einbürgerungstest · Berlin
    </a>
    <Flex as="nav" aria-label={content.navigation} css={{ ...styles.navigation }}>
      <a
        className={styles.link}
        href="/"
        lang="de"
        hrefLang="de"
        aria-current={language === 'de' ? 'page' : undefined}
      >
        Deutsch
      </a>
      <a
        className={styles.link}
        href="/en/"
        lang="en"
        hrefLang="en"
        aria-current={language === 'en' ? 'page' : undefined}
      >
        English
      </a>
    </Flex>
  </Flex>
)
