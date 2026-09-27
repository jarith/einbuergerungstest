Feature: Practice a Berlin Einbürgerungstest
  Background:
    Given I open the app with a fresh learner profile
    And I choose German as UI language

  Scenario: A live mock follows the published test format
    When I start a mock test
    Then the mock timer starts at 60 minutes
    And the mock contains 30 general and 3 Berlin questions without repeats
    And English translation is unavailable in the live mock

  Scenario: Answers remain changeable and ungraded during the test
    When I start a mock test
    And I select mock answer "A"
    And I change mock answer to "B"
    Then only mock answer "B" is selected
    And no answer feedback is shown
    When I go to the next mock question
    And I go to the previous mock question
    Then only mock answer "B" is selected

  Scenario: Blank answers warn before submission and score zero
    When I start a mock test
    And I try to submit the mock test
    Then I am warned that 33 questions are unanswered
    When I cancel mock submission
    Then the live mock remains open
    When I submit the mock test with unanswered questions
    Then the mock result is 0 of 33 and "failed"
    And the completed test review shows every question and correct answer
    When I open progress
    Then the question totals are 0 correct, 0 mistaken, and 310 untried
    And the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished
    When I open the completed test from history
    Then the completed test review shows every question and correct answer

  Scenario Outline: The pass threshold is 17 correct answers
    When I start a mock test
    And I answer <correct> mock questions correctly and leave the rest blank
    And I submit the mock test with unanswered questions
    Then the mock result is <correct> of 33 and "<result>"

    Examples:
      | correct | result |
      | 16      | failed |
      | 17      | passed |

  Scenario: Reaching the time limit submits and scores the test
    Given the browser clock is controlled
    When I start a mock test
    And 60 minutes pass
    Then the mock result is 0 of 33 and "failed"
    When I open progress
    Then the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished

  Scenario: Leaving early retains an unfinished attempt without scoring it
    When I start a mock test
    And I select mock answer "A"
    And I try to leave the mock test
    Then I see an exit confirmation
    When I stay in the mock test
    Then the live mock remains open
    And only mock answer "A" is selected
    When I leave the mock test after confirmation
    And I open progress
    Then the unfinished test appears in history without a score
    And the mock totals are 0 completed, 0 passed, 0 failed, and 1 unfinished
    And the question totals are 0 correct, 0 mistaken, and 310 untried
    When I open the unfinished test from history
    Then the unfinished test review shows mock answer "A" without a score

  Scenario: A brief interruption preserves the test but a fresh launch ends it
    Given the browser clock is controlled
    When I start a mock test
    And I select mock answer "A"
    And I briefly background the app
    Then the live mock remains open
    And only mock answer "A" is selected
    And the mock timer shows 55 minutes remaining
    When I relaunch the app
    And I open progress
    Then the unfinished test appears in history without a score
