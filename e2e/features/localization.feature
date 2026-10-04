Feature: Choose a preferred language while keeping exam content in German
  Background:
    Given a learner has no saved history

  Scenario: English is the initial preferred language and German can be selected
    Then my preferred language is English
    When I start a new all-question study session
    Then the original German content for study question 1 is available without translation
    When I choose German as my preferred language
    And I restart with my saved history
    Then my preferred language is German
    When I start a new all-question study session
    Then the original German content for study question 1 is available without translation
    And translation is unavailable in the current learning activity

  Scenario: English translation survives changing the preferred language to German and back
    When I start a new all-question study session
    And I enable English translation
    Then German and English content for study question 1 and its options is available
    When I choose German as my preferred language
    And I start a new all-question study session
    Then translation is unavailable in the current learning activity
    And the original German content for study question 1 is available without translation
    When I choose English as my preferred language
    And I start a new all-question study session
    Then German and English content for study question 1 and its options is available

  Scenario: A live mock remains German but its completed review can be translated
    When I start a mock test
    Then the live mock question and choices are in German
    And English translation is unavailable in the live mock
    When I confirm submitting the mock with unanswered questions
    And I enable English translation in the review
    Then German and English appear together in the review

  Scenario: A German language preference does not offer translation in a completed review
    When I choose German as my preferred language
    And I start a mock test
    And I confirm submitting the mock with unanswered questions
    Then translation is unavailable in the current learning activity

  Scenario: Language-neutral choices are valid German mock content
    Given the mock includes a question with language-neutral choices first
    When I start a mock test
    Then the mock question includes a language-neutral choice
    And the live mock question and choices are in German
    And English translation is unavailable in the live mock
