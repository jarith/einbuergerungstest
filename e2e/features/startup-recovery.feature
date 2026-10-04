Feature: Recover from unsupported saved learner data
  Scenario: Preserve and recover an unsupported profile before a confirmed fresh start
    Given a learner has an unsupported saved profile
    Then the saved profile is rejected without replacement
    And the original saved profile is unchanged
    When I recover the original saved data
    Then the recovered data matches the original saved profile
    When I request a fresh profile
    And I cancel the fresh start
    Then the original saved profile is unchanged
    When I request a fresh profile
    And I confirm the fresh start
    Then my preferred language is English
    When I start a new all-question study session
    And I select study answer "D"
    Then the study answer is correct
    When I restart with my saved history
    Then question 1 has status "learning"

  Scenario: Newer saved data cannot be overwritten by an old reset confirmation
    Given a learner has an unsupported saved profile
    When I request a fresh profile
    And another session replaces the rejected profile
    And I confirm the fresh start
    Then the fresh start is rejected because the saved profile changed
    And the replacement profile is unchanged

  Scenario: Unreadable saved data can be recovered before a fresh start
    Given a learner has a corrupted saved profile
    Then the saved profile is rejected without replacement
    When I recover the original saved data
    Then the recovered data matches the original saved profile
    When I request a fresh profile
    And I confirm the fresh start
    Then my preferred language is English

  Scenario: Unavailable questions do not authorize erasing learner data
    Given a learner has no saved history
    When I start a new all-question study session
    And I select study answer "D"
    And the question bank is unavailable
    Then loading can be retried without authorizing a fresh profile
    And question 1 has 1 recorded attempt

  Scenario: A completed fresh-start confirmation cannot erase new history
    Given a learner has an unsupported saved profile
    When I request a fresh profile
    And I confirm the fresh start
    And I start a new all-question study session
    And I select study answer "D"
    And I try to reuse the completed fresh-start confirmation
    Then question 1 has 1 recorded attempt
    And question 1 has status "learning"
