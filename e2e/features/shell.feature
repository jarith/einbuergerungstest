Feature: Responsive application shell
  Scenario: Desktop navigation stays beside the page
    Given the browser viewport is 1440 by 1000
    And I open the app with a fresh learner profile
    Then the navigation appears beside the main content

  Scenario: Phone navigation stays at the bottom of the viewport
    Given the browser viewport is 390 by 844
    And I open the app with a fresh learner profile
    Then the navigation stays at the bottom of the viewport
    And the application fits the viewport width
