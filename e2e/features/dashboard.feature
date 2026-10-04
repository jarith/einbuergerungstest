Feature: Track learning progress and a planned test date

  Scenario: Progress counts contributing questions and rounds to a whole percent
    Given a learner has no saved history
    Then overall progress is 0 of 310 questions contributing to progress and 0 percent
    When I start a new all-question study session
    And I select study answer "A"
    Then overall progress is 0 of 310 questions contributing to progress and 0 percent
    When I start a new study session at question 1
    And I select study answer "D"
    Then overall progress is 1 of 310 questions contributing to progress and 0 percent
    When I start a new study session at question 2
    And I select study answer "B"
    Then overall progress is 2 of 310 questions contributing to progress and 1 percent
    When I start a new study session at question 1
    And I select study answer "A"
    Then overall progress is 1 of 310 questions contributing to progress and 0 percent

  Scenario: A planned date counts down, marks today, and clears on the next opening
    Given a learner starts on local date "2026-09-26"
    When I set the test date to "2026-10-01"
    Then there are 5 local calendar days until the test
    When the local date becomes "2026-10-01"
    And I restart with my saved history
    Then the planned test is today
    When the local date becomes "2026-10-02"
    And I restart with my saved history
    Then there is no current test countdown
    And the test date is empty

  Scenario: A past date is rejected and a future date can be cleared manually
    Given a learner starts on local date "2026-09-26"
    When I try to set the test date to "2026-09-25"
    Then the past test date is rejected
    And there is no current test countdown
    When I set the test date to "2026-10-01"
    Then there are 5 local calendar days until the test
    When I clear the test date
    And I restart with my saved history
    Then there is no current test countdown

  Scenario: Backup and import restore the selected language and test date
    Given a learner starts on local date "2026-09-26"
    When I choose German as my preferred language
    And I set the test date to "2026-10-01"
    And I create a backup of my progress
    And I choose English as my preferred language
    And I clear the test date
    And I preview the saved backup
    And I confirm replacing local progress
    Then my preferred language is German
    And there are 5 local calendar days until the test

  Scenario: The countdown refreshes at local midnight before the UTC day changes
    Given a learner starts on local date "2026-10-02"
    When I set the test date to "2026-10-03"
    And the learner resumes at "2026-10-02T23:59:00+02:00"
    Then there are 1 local calendar days until the test
    When 1 minute passes
    Then the planned test is today
    When the learner resumes at "2026-10-04T08:00:00+02:00"
    Then there is no current test countdown
    And the test date remains "2026-10-03"
    When I restart with my saved history
    Then the test date is empty

  Scenario: Resuming across the autumn timezone change refreshes the local calendar day
    Given a learner starts on local date "2026-10-24"
    When I set the test date to "2026-10-25"
    Then there are 1 local calendar days until the test
    When the learner resumes at "2026-10-25T08:00:00+01:00"
    Then the planned test is today
