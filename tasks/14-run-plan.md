# Task 14 — Live mock page execution plan

1. Connect route loaders to the shared mock model and resolve the URL-selected question.
2. Add start, timer/question, previous/next, answered summary, question picker, blank
   submission confirmation and exit controls using the existing design system.
3. Connect deadline expiry and completed-result navigation to the page model lifecycle.
   Audit German-only live content, drafts, backgrounding, keyboard/dialog behavior,
   all departure paths, and desktop/tablet/phone design fidelity; run required checks.
4. Repeat the audit and checks, format once, and commit. Add no tests.

## Tracking

- [x] Inspect design, shared presentation, router and navigation policy.
- [x] Implement.
- [x] First audit and checks.
- [x] Second audit and checks.
- [x] Format once and commit.

## Audit results

Both cycles verified revisable answers surviving next/previous navigation, German-only
live content, all 33 picker entries, blank warning and return-to-list, canceled exit,
browser-back departure confirmation, and automatic/manual result routing. Deadline
inspection confirmed a completed timeout in IndexedDB. The desktop/tablet/phone layouts
were compared with the supplied design; phone controls and summary were tightened.
Axe reported no violations in phone and tablet states, with no horizontal overflow.
Fixed initial lint spacing/shadowing and invalid visual variant/token values. Both final
validation cycles passed lint, TypeScript and 443 tests plus 20 ast-grep suites.
The result route remains its existing placeholder until task 15. No tests were added.
