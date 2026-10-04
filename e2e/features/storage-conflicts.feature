Feature: Preserve newer saved data when sessions conflict
  Background:
    Given a learner has no saved history

  Scenario: A stale mock answer cannot replace the saved unfinished choice
    When I start a mock test
    And I select mock answer "A"
    And another session saves newer preferences
    And I select a stale mock answer "B"
    Then the stale change is rejected
    When I restart with my saved history
    And I review the unfinished mock
    Then the unfinished review retains answer "A" without grading

  Scenario: A stale mock submission cannot grade saved answers
    When I start a mock test
    And I select mock answer "A"
    And another session saves newer preferences
    And I submit the stale mock test
    Then the stale change is rejected
    When I restart with my saved history
    And I review the unfinished mock
    Then the unfinished review retains answer "A" without grading

  Scenario: A stale translation change cannot overwrite newer preferences
    When I start a mock test
    And I confirm submitting the mock with unanswered questions
    And another session saves newer preferences
    And I try to change the stale review translation
    Then the stale change is rejected
    When I restart with my saved history
    Then the review translation remains disabled
    And the newer appearance preference is preserved
