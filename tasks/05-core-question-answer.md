# 05 — Core question and answer rules

## Goal

Share the question presentation and answer rules used by study, progress, completed
review, and the live mock without coupling their page components.

## Work

- In question-bank/domain, define option selection and correctness as pure rules.
  Distinguish immediate study feedback from hidden live-mock grading. A study answer
  creates a timestamped attempt; retry creates another attempt and preserves earlier
  history. A mock selection remains a revisable draft until the sitting completes.
- In question-bank/components, render German question/choice content, optional English
  text in allowed contexts, four choices, correct/wrong text and icons, and all image
  variants. Add an accessible image enlargement state with the original/full image for
  illustrated questions.
- Reuse the design-system controls and tokens. Keep domain recording in learner-state
  application actions, not in React components. Expose a small presentation contract so
  study and mock pages select the correct mode.

## Complete when

The same question can be shown in study, mock, and review with the proper feedback policy,
translation policy, and image behavior. This is the base for
[ordered study](08-ordered-study.md) and [mock tests](13-mock-test-domain.md).
