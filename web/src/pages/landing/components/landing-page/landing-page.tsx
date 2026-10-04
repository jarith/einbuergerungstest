import { ButtonLink, DesignSystemProvider, Divider } from '@einbuergerungstest/design-system'
import { Container, Flex, Grid, Stack } from '@einbuergerungstest/design-system/jsx'

import { getLandingContent } from '../../landing-content'
import { LandingHeader } from './components/landing-header/landing-header'
import { styles } from './landing-page.styles'

type LandingPageProps = Readonly<{ language: 'de' | 'en' }>

export const LandingPage = ({ language }: LandingPageProps) => {
  const content = getLandingContent(language)

  return (
    <DesignSystemProvider>
      <a className={styles.skip} href="#main">
        {content.skip}
      </a>
      <Container css={{ ...styles.page }}>
        <LandingHeader language={language} content={content} />
        <Stack as="main" id="main" tabIndex={-1} gap="48">
          <Stack css={{ ...styles.hero }}>
            <p className={styles.eyebrow}>BERLIN · DEUTSCH / ENGLISH</p>
            <h1 className={styles.title}>{content.heading}</h1>
            <p className={styles.lead}>{content.lead}</p>
            <p className={styles.copy}>{content.intro}</p>
            <Flex css={{ ...styles.actions }}>
              <ButtonLink href="/study">{content.start}</ButtonLink>
              <ButtonLink href="/dashboard" appearance="ghost">
                {content.dashboard}
              </ButtonLink>
            </Flex>
          </Stack>
          <Divider />
          <Grid css={{ ...styles.features }}>
            {content.features.map((feature) => (
              <Stack as="section" key={feature.title} css={{ ...styles.section }}>
                <h2 className={styles.heading}>{feature.title}</h2>
                <p className={styles.copy}>{feature.text}</p>
              </Stack>
            ))}
          </Grid>
          <Divider />
          <Stack as="section" css={{ ...styles.section }}>
            <h2 className={styles.heading}>{content.closing}</h2>
            <p className={styles.copy}>{content.closingText}</p>
            <Flex css={{ ...styles.actions }}>
              <ButtonLink href="/study">{content.start}</ButtonLink>
            </Flex>
          </Stack>
          <Stack as="footer" css={{ ...styles.footer }}>
            <p>{content.footer}</p>
            <a
              className={styles.link}
              href="https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html"
            >
              {content.source}
            </a>
          </Stack>
        </Stack>
      </Container>
    </DesignSystemProvider>
  )
}
