Feature: Recover from unsupported saved learner data without migration
  Scenario: Preserve and download an older profile before a confirmed fresh start
    Given I open the app with a version-1 saved profile
    Then startup explains that saved data cannot be loaded
    And the original saved profile is unchanged
    When I download the saved data from startup recovery
    Then the download contains the original saved profile
    When I request a fresh profile from startup recovery
    And I cancel the startup reset
    Then the original saved profile is unchanged
    When I request a fresh profile from startup recovery
    And I confirm the startup reset
    Then English interface controls are visible
    When I start studying
    And I select study answer "D"
    Then I see immediate correct feedback
    When I reload the app
    And I open progress
    Then question 1 has status "learning"

  Scenario: A changed snapshot cannot be overwritten by an old reset confirmation
    Given I open the app with a version-1 saved profile
    When I request a fresh profile from startup recovery
    And another window replaces the rejected profile
    And I confirm the startup reset
    Then startup reset offers conflict recovery
    And the replacement profile is unchanged

  Scenario: Damaged JSON can be downloaded and reset without decoding it
    Given I open the app with a damaged saved profile
    Then startup explains that saved data cannot be loaded
    When I download the saved data from startup recovery
    Then the download contains the original saved profile
    When I request a fresh profile from startup recovery
    And I confirm the startup reset
    Then English interface controls are visible

  Scenario: A question download failure does not offer to erase learner data
    Given the question bank cannot be downloaded
    Then startup offers retry without reset
