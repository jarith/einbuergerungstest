Feature: Finalize mock tests independently of history timestamps
  Background:
    Given I open the app with a fresh learner profile
    And I choose German as UI language
    And the browser clock is controlled
    And I import a study attempt dated tomorrow

  Scenario: Future-dated history does not grade an early exit
    When I start a mock test
    And I select mock answer "A"
    And I leave the mock test after confirmation
    And I open progress
    Then the unfinished test appears in history without a score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned
    When I open the unfinished test from history
    Then the unfinished test review shows mock answer "A" without a score

  Scenario: A backward clock adjustment does not grade an early exit
    When I start a mock test
    And I select mock answer "A"
    And the browser clock moves backward one day
    And I leave the mock test after confirmation
    And I open progress
    Then the unfinished test appears in history without a score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned

  Scenario: Future-dated history preserves the manual submission reason
    When I start a mock test
    And I submit the mock test with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the review reports manual submission
    When I reload the app
    Then the review reports manual submission

  Scenario: A backward clock adjustment preserves the manual submission reason
    When I start a mock test
    And the browser clock moves backward one day
    And I submit the mock test with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the review reports manual submission

  Scenario: Future-dated history preserves the deadline expiry reason
    When I start a mock test
    And 60 minutes pass
    Then the mock result is 0 of 33 and "failed"
    And the review reports deadline expiry
    When I reload the app
    Then the review reports deadline expiry
