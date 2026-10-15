Feature: Practice a Berlin Einbürgerungstest
  Background:
    Given a learner has no saved history
    When I choose German as my preferred language

  Scenario: A live mock follows the published test format
    When I start a mock test
    Then the mock has 60 minutes remaining
    And the mock contains 30 general and 3 Berlin questions without repeats
    And English translation is unavailable in the live mock

  Scenario: Answers remain changeable and ungraded during the test
    When I start a mock test
    And I select mock answer "A"
    And I change mock answer to "B"
    Then the selected mock answer is "B"
    And answer correctness is withheld
    When I go to the next mock question
    Then I am on mock question 2
    When I go to the previous mock question
    Then I am on mock question 1
    And the selected mock answer is "B"

  Scenario: Blank answers warn before submission and score zero
    When I start a mock test
    And I request mock submission
    Then submission awaits confirmation for 33 unanswered questions
    When I cancel mock submission
    Then the mock remains active
    When I confirm submitting the mock with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the completed review includes every unanswered question and its correct answer
    And the question totals are 310 not started, 0 needing review, 0 learning, and 0 learned
    And the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished
    When I review the completed mock
    Then the completed review includes every unanswered question and its correct answer

  Scenario Outline: The pass threshold is 17 correct answers
    When I start a mock test
    And I answer <correct> mock questions correctly and leave the rest blank
    And I confirm submitting the mock with unanswered questions
    Then the mock result is <correct> of 33 and "<result>"

    Examples:
      | correct | result |
      | 16      | failed |
      | 17      | passed |

  Scenario: Reaching the time limit submits and scores the test
    Given the current time is "2026-01-01T10:00:00Z"
    When I start a mock test
    And 60 minutes pass
    Then the mock result is 0 of 33 and "failed"
    And the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished

  Scenario: Leaving early retains an unfinished attempt without scoring it
    When I start a mock test
    And I select mock answer "A"
    And I request to end the mock early
    Then ending the mock awaits confirmation
    When I cancel ending the mock
    Then the mock remains active
    And the selected mock answer is "A"
    When I confirm ending the mock early
    Then the saved mock is unfinished and has no score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 310 not started, 0 needing review, 0 learning, and 0 learned
    When I review the unfinished mock
    Then the unfinished review retains answer "A" without grading

  Scenario: A brief interruption preserves the test but a fresh launch ends it
    Given the current time is "2026-01-01T10:00:00Z"
    When I start a mock test
    And I select mock answer "A"
    And the learner pauses for 5 minutes without ending the session
    Then the mock remains active
    And the selected mock answer is "A"
    And the mock has 55 minutes remaining
    When I restart with my saved history
    Then the saved mock is unfinished and has no score
