Feature: Keep and move learning progress on this device
  Background:
    Given a learner has no saved history
    When I choose German as my preferred language

  Scenario: A completed mock answer updates the matching question
    When I start a mock test
    And I answer the first mock question correctly
    And I confirm submitting the mock with unanswered questions
    Then that mock question has status "learning"
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned

  Scenario: Export and import restore complete history after confirmation
    When I choose English as my preferred language
    And I start a new all-question study session
    And I enable English translation
    And I select study answer "A"
    And I create a backup of my progress
    And I start a new study session at question 1
    And I select study answer "D"
    And I preview the saved backup
    Then the import preview describes 1 study attempt
    When I confirm replacing local progress
    Then question 1 has status "needs-review"
    And question 1 has 1 recorded attempt
    When I start a new study session at question 1
    Then German and English content for study question 1 and its options is available

  Scenario: Export and import restore completed mock history
    When I start a mock test
    And I confirm submitting the mock with unanswered questions
    And I create a backup of my progress
    And I request and confirm a progress reset
    And I preview the saved backup
    Then the import preview describes 1 completed mock test
    When I confirm replacing local progress
    Then the mock totals are 1 completed, 0 passed, 1 failed, and 0 unfinished

  Scenario: An invalid backup leaves existing progress untouched
    When I start a new all-question study session
    And I select study answer "D"
    And I preview an invalid backup
    Then the backup is rejected
    And question 1 has status "learning"

  Scenario: Reset requires confirmation and erases progress
    When I start a new all-question study session
    And I select study answer "D"
    And I request a progress reset
    Then reset awaits confirmation
    When I cancel the reset
    Then question 1 has status "learning"
    When I request and confirm a progress reset
    Then the question totals are 310 not started, 0 needing review, 0 learning, and 0 learned
    And the mock totals are 0 completed, 0 passed, 0 failed, and 0 unfinished

  Scenario Outline: Filtering does not change bank-wide status totals
    When I choose <language> as my preferred language
    And I start a new all-question study session
    And I select study answer "D"
    And I filter questions by "learned"
    Then there are no questions in this status
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned
    When I filter questions by "learning"
    Then the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned

    Examples:
      | language |
      | English  |
      | German   |

  Scenario: Import confirmation cannot authorize another replacement
    When I start a new all-question study session
    And I select study answer "A"
    And I create a backup of my progress
    And I preview the saved backup
    And I confirm replacing local progress
    And I start a new all-question study session
    And I select study answer "D"
    And I try to reuse the previous replacement confirmation
    Then the replacement is refused and saved history is unchanged
    And question 1 has 2 recorded attempts

  Scenario: Reset confirmation cannot erase subsequent progress
    When I request and confirm a progress reset
    And I start a new all-question study session
    And I select study answer "D"
    And I try to reuse the previous replacement confirmation
    Then the replacement is refused and saved history is unchanged
    And question 1 has 1 recorded attempt
