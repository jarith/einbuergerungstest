# Analytics coverage

Umami Cloud tracks the production hostname `einbuergerungstest.jarith.dev` using website
`8a47450b-9c48-4fe9-ad8c-c4fa8f1db330`. Both HTML entry points load the tracker; it
records pageviews and SPA navigation automatically. Local and preview hostnames do not
collect events. The public analytics entry does not load the learner application or
IndexedDB.

## Events

Custom events include `app_mode` (`web` or `pwa`) and `ui_language` (`de` or `en`). Public
pages use their displayed language; application events use the current UI language. Umami
supplies device category, browser, OS, screen size, and browser language separately.

| Event                                                                                       | Trigger                                                                                 | Additional properties                                                                     |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `site_visited`                                                                              | Each browser document load, including direct app entries                                | `entry_path`                                                                              |
| `learning_started_web`, `learning_started_pwa`                                              | First saved answer in an ordered study session; excludes individual-question inspection | `scope` (`all` or `group`), optional `group_id`                                           |
| `browser_used`                                                                              | First saved study answer, mock start, or mock answer in a browser document              | `activity` (`study` or `mock`)                                                            |
| `mock_started`                                                                              | New sitting successfully saved                                                          | `mock_id`, `question_count`                                                               |
| `mock_finished`                                                                             | Tracked sitting successfully completed, including timeout                               | `mock_id`, `answered_count`, `question_count`                                             |
| `mock_unfinished`                                                                           | Tracked sitting saved as unfinished                                                     | `mock_id`, `answered_count`, `question_count`, `reason` (`exit` or `recovered_on_launch`) |
| `pwa_installed`                                                                             | Browser's `appinstalled` event                                                          | `detection: appinstalled`                                                                 |
| `pwa_opened`                                                                                | Standalone launch, or transition to standalone, once per document                       | `first_observed`                                                                          |
| `pwa_first_opened`                                                                          | First observed standalone use in available local storage                                | `detection: standalone`                                                                   |
| `learning_reached_25`, `learning_reached_50`, `learning_reached_75`, `learning_reached_100` | First crossing of each Learned threshold                                                | `learned_count`, `total_questions`, `basis: learned`                                      |
| `language_preference_observed`                                                              | Saved preferences first loaded                                                          | `language`                                                                                |
| `language_preference_changed`                                                               | Different language successfully saved, including replacement of preferences             | `previous_language`, `language`                                                           |

Use Umami's unique visitor counts for people/conversion questions; event totals count
occurrences. A person can use both browser and PWA, multiple study sessions, or multiple
devices. `browser_used` does not mean that the user has never installed the app.

Learning starts only after a saved answer, not a CTA click or question view. A completed
pass restart starts a new study session. Question navigation and React remounts do not.

Milestones use **Learned only** (two consecutive correct answers), unlike the dashboard's
Learning + Learned percentage. Thresholds use the unrounded fraction: with 310 questions,
the required counts are 78, 155, 233, and 310. Completed mocks can contribute. Every newly
crossed milestone is emitted, including multiple thresholds crossed in one update.
Regressions and subsequent recovery do not repeat milestones in the same local history.
Existing progress and imported backups establish a baseline, without historical events.
Reset/import replaces the milestone history and establishes a new baseline.

## Funnels

Create Triggered event steps with these exact names. Start with a 60-minute maximum
between consecutive acquisition steps, then adjust to observed usage.

- Browser learning: `site_visited` → `learning_started_web`.
- Observed install conversion: `site_visited` → `pwa_installed` → `learning_started_pwa`.
- PWA activation: `pwa_opened` → `learning_started_pwa`.
- First observed PWA use: `pwa_first_opened` → `learning_started_pwa`.
- Mock visitor conversion: `mock_started` → `mock_finished`.

Mock funnels measure visitor conversion, not per-sitting conversion. Use lifecycle events
and `mock_id` to correlate individual sittings; do not treat all starts without a finish
as confirmed unfinished tests. Some are still active or have unobserved outcomes.

The install funnel is incomplete on browsers without `appinstalled`, and when browser and
PWA activity cannot be associated by Umami. iOS PWA storage can be separate from browser
storage. `pwa_first_opened` proves observed standalone use, not a new installation at that
time. It is not synthesized into `pwa_installed`. Clearing storage can cause a later
launch to count as first observed again. No persistent user identity is added.

## Ownership and delivery

Analytics observers live in `.analytics.ts` files beside their owning application/domain
module. The app composes subscriptions and disposes them with its lifecycle. It observes
saved outcomes without wrapping business actions or making them await network requests.
Study tracking reads the existing session's answer map. There are no analytics tests, as
requested; verification uses type/lint/build checks and manual browser inspection.

Analytics bookkeeping uses `einbuergerungstest.analytics.v1.*` local-storage keys for
milestones, first PWA use, and the tracked active mock. These keys are not learner state
and are not exported in backups. Storage failures fall back to memory for that document.
After restart, a tracked active sitting normalized to unfinished emits its recovered
outcome. Imported historical tests never emit new lifecycle events. If a visitor closes
the app and never returns, there is no reliable confirmed unfinished event.

Delivery is best effort: at most 50 events wait in memory for up to 10 seconds while the
tracker loads. Offline events are dropped; there is no durable offline queue or automatic
retry of failed deliveries. Local deduplication records observations, not server receipts.
Blocked scripts, closed documents, network failures, and unavailable storage can therefore
undercount activity. Analytics failures do not change learning, navigation, saved answers,
mock status, or the offline cache lifecycle.

No individual answers, question histories, backup contents, planned test dates, or custom
user identifiers are sent. Automatic pageviews still include the current URL and Umami's
standard metadata. The existing random mock ID is used only to correlate its lifecycle.

References: [tracker functions](https://docs.umami.is/docs/tracker-functions),
[configuration](https://docs.umami.is/docs/tracker-configuration),
[funnels](https://docs.umami.is/docs/funnel),
[metric definitions](https://docs.umami.is/docs/metric-definitions),
[PWA detection](https://web.dev/learn/pwa/detection).
