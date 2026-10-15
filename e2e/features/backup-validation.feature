Feature: Reject unsafe backups before replacing progress
  Background:
    Given a learner has no saved history
    When I start a new all-question study session
    And I select study answer "D"
    And I create a backup of my progress

  Scenario: Oversized files are rejected before reading their contents
    When I select a backup larger than 10 MiB
    Then the oversized backup is rejected without reading it
    And my saved history is unchanged after restarting

  Scenario Outline: Invalid imports cannot replace saved history
    When I preview a backup with "<problem>"
    Then the unsafe backup has no replacement preview
    And my saved history is unchanged after restarting

    Examples:
      | problem                         |
      | an identifier longer than 64    |
      | more than 50000 study attempts  |
      | more than 1000 mock tests       |
      | deeply nested unused data      |
      | the maximum date timestamp      |
      | a study timestamp beyond a day  |
      | a mock start beyond a day       |
      | a mock finish beyond a day      |

  Scenario: Oversized UTF-8 text is rejected by its encoded size
    When I preview a backup with "oversized UTF-8 text"
    Then the oversized text is rejected by its encoded size
    And the unsafe backup has no replacement preview
    And my saved history is unchanged after restarting

  Scenario: Supported clock skew still permits saving subsequent answers
    When I import a study attempt dated tomorrow
    And I start a new study session at question 1
    And I select study answer "D"
    And I restart with my saved history
    Then question 1 has 3 recorded attempts

  Scenario: A supported identifier and backup at the byte limit can be imported
    When I preview a backup at the supported size and identifier limits
    Then the import preview describes 1 study attempt
    When I confirm replacing local progress
    And I start a new study session at question 1
    And I select study answer "D"
    And I restart with my saved history
    Then question 1 has 2 recorded attempts
