# 01 — Resources and question bank

## Goal

Provide one validated Berlin question bank and every referenced image to the
app and offline cache. Keep the current web/public bank and images as the authored source
and preserve their runtime URLs.

## Work

- In modules/question-bank/domain, define the bank, group, question, option, image, and
  stable question-key contracts. Validate 300 general plus 10 Berlin questions, four
  labeled choices with one correct option, German and English question/option text, unique
  stable keys, group membership, source IDs, image dimensions, and every referenced image
  variant.
- Keep the authored bank and images in web/public. Validate all 13 groups' English and
  German titles/descriptions, and treat display number as presentation data rather than
  a persistence key.
- Publish the bank and image files at their existing static URLs. Let the later PWA build
  generate its precache from the output.
- Fetch the bank at startup, validate it at runtime, resolve image URLs against the bank
  asset URL, and expose loading/error/retry states. Render images with native `<img>` and
  `srcset` when their questions are shown.

## Complete when

The app can obtain the full bank; all 310 questions validate and all 35 referenced image
files exist in the production build. A missing or malformed bank fails visibly before
study or mock actions start; image loading happens when an
illustrated question is shown. This task feeds [router](04-router-shell.md),
[study](08-ordered-study.md), and [PWA](20-pwa.md).
