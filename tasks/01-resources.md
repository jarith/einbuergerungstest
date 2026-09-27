# 01 — Resources and question bank

## Goal

Provide one validated, versioned Berlin question bank and every referenced image to the
app and offline cache. Keep the current web/public bank and images as the authored source
and preserve their runtime URLs.

## Work

- In modules/question-bank/domain, define the bank, group, question, option, image, and
  stable question-key contracts. Validate 300 general plus 10 Berlin questions, four
  labeled choices with one correct option, German and English question/option text, unique
  stable keys, group membership, source IDs, image dimensions, and every referenced image
  variant.
- Keep the authored bank and images in web/public. Validate all 13 groups' English and
  German titles/descriptions, add a bank revision, and treat display number as
  presentation data rather than a persistence key.
- Publish the current bank URL with its revision in the data and offline cache version.
  Produce an asset list for the PWA precache from the same validated source.
- In question-bank/infrastructure and application, fetch once through a cached promise,
  validate at runtime, index by stable key/group/display order, resolve image URLs against
  the bank asset URL, and expose loading/error/retry states.

## Complete when

Routes can obtain the full bank without duplicate fetches; all 310 questions and 35 unique
image files resolve; missing or malformed content fails visibly before study or mock
actions start. This task feeds [router](04-router-shell.md), [study](08-ordered-study.md),
and [PWA](20-pwa.md).
