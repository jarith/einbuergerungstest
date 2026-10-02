Feature: Choose an interface language while keeping exam content in German
  Background:
    Given I open the app with a fresh learner profile

  Scenario: English is the initial interface language and German can be selected
    Then English interface controls are visible
    When I start studying
    Then the original German text for study question 1 is visible without translation
    When I choose German as UI language
    And I reload the app
    Then German interface controls are visible
    When I resume studying
    Then the original German text for study question 1 is visible without translation
    And the translation control is absent

  Scenario: English study translation survives a switch through German UI
    When I start studying
    And I enable English translation
    Then German and English text for study question 1 and its options are visible
    When I choose German as UI language
    And I resume studying
    Then the translation control is absent
    And the original German text for study question 1 is visible without translation
    When I choose English as UI language
    And I resume studying
    Then German and English text for study question 1 and its options are visible

  Scenario: A live mock remains German but its completed review can be translated
    When I start a mock test
    Then the live mock question and choices are in German
    And English translation is unavailable in the live mock
    When I submit the mock test with unanswered questions
    And I enable English translation in the review
    Then German and English appear together in the review

  Scenario: German UI does not offer translation in a completed review
    When I choose German as UI language
    And I start a mock test
    And I submit the mock test with unanswered questions
    Then the translation control is absent

  Scenario: Language-neutral choices are valid German mock content
    Given the mock sampler selects a question with language-neutral choices first
    When I start a mock test
    Then the mock question includes a language-neutral choice
    And the live mock question and choices are in German
    And English translation is unavailable in the live mock
