Feature: Finalize mock tests independently of history timestamps
  Background:
    Given a learner has no saved history
    When I choose German as my preferred language
    Then the current time is "2026-01-01T10:00:00Z"
    When I import a study attempt dated tomorrow

  Scenario: Future-dated history does not grade an early exit
    When I start a mock test
    And I select mock answer "A"
    And I confirm ending the mock early
    Then the saved mock is unfinished and has no score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned
    When I review the unfinished mock
    Then the unfinished review retains answer "A" without grading

  Scenario: A backward clock adjustment does not grade an early exit
    When I start a mock test
    And I select mock answer "A"
    And the device clock moves backward one day
    And I confirm ending the mock early
    Then the saved mock is unfinished and has no score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned

  Scenario: Future-dated history preserves the manual submission reason
    When I start a mock test
    And I confirm submitting the mock with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the review reports manual submission
    When I restart with my saved history
    Then the review reports manual submission

  Scenario: A backward clock adjustment preserves the manual submission reason
    When I start a mock test
    And the device clock moves backward one day
    And I confirm submitting the mock with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the review reports manual submission

  Scenario: Future-dated history preserves the deadline expiry reason
    When I start a mock test
    And 60 minutes pass
    Then the mock result is 0 of 33 and "failed"
    And the review reports deadline expiry
    When I restart with my saved history
    Then the review reports deadline expiry
