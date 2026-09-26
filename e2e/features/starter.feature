Feature: A fresh application
  Scenario: Use the starter and change its theme
    Given I open the starter
    When I increment the counter
    And I switch to the dark theme
    Then the count remains 1
    And the application uses the dark theme
    When I reset the counter
    Then the count is 0
