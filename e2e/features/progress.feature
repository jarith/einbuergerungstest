Feature: Keep and move learning progress on this device
  Background:
    Given I open the app with a fresh learner profile
    And I choose German as UI language

  Scenario: A completed mock answer updates the matching question
    When I start a mock test
    And I answer the first mock question correctly
    And I submit the mock test with unanswered questions
    And I open progress
    Then that mock question has status "correct"
    And the question totals are 1 correct, 0 mistaken, and 309 untried

  Scenario: Export and import restore complete history after confirmation
    When I choose English as UI language
    And I start studying
    And I enable English translation
    And I select study answer "A"
    And I open progress
    And I export my progress
    And I open question 1 from progress
    And I retry the study question
    And I select study answer "D"
    And I open progress
    And I import the exported progress
    Then the import preview describes 1 study attempt
    When I confirm replacing local progress
    And I open progress
    Then question 1 has status "mistaken"
    And question 1 has 1 recorded attempt
    When I open question 1 from progress
    Then German and English text for study question 1 and its options are visible

  Scenario: Export and import restore completed mock history
    When I start a mock test
    And I submit the mock test with unanswered questions
    And I open progress
    And I export my progress
    And I reset progress after confirmation
    And I import the exported progress
    Then the import preview describes 1 completed mock test
    When I confirm replacing local progress
    And I open progress
    Then the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished

  Scenario: An invalid backup leaves existing progress untouched
    When I start studying
    And I select study answer "D"
    And I open progress
    And I import an invalid progress file
    Then I see a backup validation error
    When I open progress
    Then question 1 has status "correct"

  Scenario: Reset requires confirmation and erases progress
    When I start studying
    And I select study answer "D"
    And I open progress
    And I try to reset progress
    Then I see a reset confirmation
    When I cancel the reset
    Then question 1 has status "correct"
    When I reset progress after confirmation
    Then the question totals are 0 correct, 0 mistaken, and 310 untried
    And the mock totals are 0 completed, 0 passed, 0 failed, and 0 unfinished
