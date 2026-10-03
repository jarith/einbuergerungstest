Feature: See learning progress and a planned test date on the dashboard

  Scenario: Progress counts contributing questions and rounds to a whole percent
    Given I open the app with a fresh learner profile
    Then the dashboard shows 0 of 310 questions contributing to progress and 0 percent
    When I start studying
    And I select study answer "A"
    And I open dashboard
    Then the dashboard shows 0 of 310 questions contributing to progress and 0 percent
    When I open progress
    And I open question 1 from progress
    And I select study answer "D"
    And I open dashboard
    Then the dashboard shows 1 of 310 questions contributing to progress and 0 percent
    When I open progress
    And I open question 2 from progress
    And I select study answer "B"
    And I open dashboard
    Then the dashboard shows 2 of 310 questions contributing to progress and 1 percent
    When I open progress
    And I open question 1 from progress
    And I select study answer "A"
    And I open dashboard
    Then the dashboard shows 1 of 310 questions contributing to progress and 0 percent

  Scenario: A planned date counts down, marks today, and clears on the next opening
    Given I open the app on local date "2026-09-26"
    When I open settings
    And I set the test date to "2026-10-01"
    And I open dashboard
    Then the dashboard shows 5 days until the test
    When the local date becomes "2026-10-01"
    And I reload the app
    Then the dashboard says the test is today
    When the local date becomes "2026-10-02"
    And I reload the app
    Then the dashboard has no test date message
    When I open settings
    Then the test date is empty

  Scenario: A past date is rejected and a future date can be cleared manually
    Given I open the app on local date "2026-09-26"
    When I open settings
    And I try to set the test date to "2026-09-25"
    Then the past test date is rejected with visible feedback
    When I open dashboard
    Then the dashboard has no test date message
    When I open settings
    And I set the test date to "2026-10-01"
    And I open dashboard
    Then the dashboard shows 5 days until the test
    When I open settings
    And I clear the test date
    And I open dashboard
    And I reload the app
    Then the dashboard has no test date message

  Scenario: Backup and import restore the selected language and test date
    Given I open the app on local date "2026-09-26"
    When I choose German as UI language
    And I open settings
    And I set the test date to "2026-10-01"
    And I open progress
    And I export my progress
    And I choose English as UI language
    And I open settings
    And I clear the test date
    And I open progress
    And I import the exported progress
    And I confirm replacing local progress
    And I open dashboard
    Then German interface controls are visible
    And the dashboard shows 5 days until the test

  Scenario: An open dashboard refreshes at local midnight before the UTC day changes
    Given I open the app on local date "2026-10-02"
    When I open settings
    And I set the test date to "2026-10-03"
    And I open dashboard
    And the app resumes at "2026-10-02T23:59:00+02:00"
    Then the dashboard shows 1 days until the test
    When 1 minute passes on the dashboard
    Then the dashboard says the test is today
    When the app resumes at "2026-10-04T08:00:00+02:00"
    Then the dashboard has no test date message
    When I open settings
    Then the test date remains "2026-10-03"
    When I reload the app
    Then the test date is empty

  Scenario: Resuming across the autumn timezone change refreshes the local calendar day
    Given I open the app on local date "2026-10-24"
    When I open settings
    And I set the test date to "2026-10-25"
    And I open dashboard
    Then the dashboard shows 1 days until the test
    When the app resumes at "2026-10-25T08:00:00+01:00"
    Then the dashboard says the test is today
