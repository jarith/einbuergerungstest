import { renderToStaticMarkup } from 'react-dom/server'

import { getLandingContent, LandingPage } from '../../pages/landing'
import { getSiteOrigin } from './site'

export const renderPublic = (template: string, language: 'de' | 'en', isIndexable: boolean) => {
  const content = getLandingContent(language)
  const origin = getSiteOrigin()
  const url = `${origin}${language === 'de' ? '/' : '/en/'}`
  const image = `${origin}/social/berlin-test.png`

  const head = renderToStaticMarkup(
    <>
      <title>{content.title}</title>
      <meta name="description" content={content.description} />
      <meta name="robots" content={isIndexable ? 'index, follow' : 'noindex, follow'} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="de" href={`${origin}/`} />
      <link rel="alternate" hrefLang="en" href={`${origin}/en/`} />
      <link rel="alternate" hrefLang="x-default" href={`${origin}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Einbürgerungstest Berlin" />
      <meta property="og:title" content={content.title} />
      <meta property="og:description" content={content.description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={language === 'de' ? 'de_DE' : 'en_GB'} />
      <meta property="og:locale:alternate" content={language === 'de' ? 'en_GB' : 'de_DE'} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Einbürgerungstest Berlin · 310 Fragen / questions" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={content.title} />
      <meta name="twitter:description" content={content.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="Einbürgerungstest Berlin · 310 Fragen / questions" />
    </>,
  )

  return template
    .replace('lang="de"', `lang="${language}"`)
    .replace('<!--public-head-->', head)
    .replace('<!--public-content-->', renderToStaticMarkup(<LandingPage language={language} />))
}
