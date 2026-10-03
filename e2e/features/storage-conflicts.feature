Feature: Recover safely after another app window changes saved data
  Background:
    Given I open the app with a fresh learner profile

  Scenario: A stale mock answer offers reload and preserves the saved unfinished choice
    When I start a mock test
    And I select mock answer "A"
    And another app window changes the saved preferences
    And I select a stale mock answer "B"
    Then I see storage conflict guidance with a reload action
    When I reload using the conflict recovery action
    And I open progress
    And I open the unfinished test from history
    Then the unfinished review retains answer "A" without grading

  Scenario: A stale mock submission offers reload inside its confirmation
    When I start a mock test
    And I select mock answer "A"
    And another app window changes the saved preferences
    And I submit the stale mock test
    Then the submission dialog offers conflict recovery
    When I reload using the conflict recovery action
    And I open progress
    And I open the unfinished test from history
    Then the unfinished review retains answer "A" without grading

  Scenario: A stale review translation setting offers reload without overwriting preferences
    When I start a mock test
    And I submit the mock test with unanswered questions
    And another app window changes the saved preferences
    And I try to change the stale review translation
    Then I see storage conflict guidance with a reload action
    When I reload using the conflict recovery action
    Then the newer appearance preference is preserved
    And the review translation remains disabled
