Feature: Install and use the app on mobile devices
  Background:
    Given I open the app with a fresh learner profile
    And I choose German as UI language

  Scenario: The app has installation metadata and iOS guidance
    Then the app manifest supports a standalone launch with icons
    When I open installation guidance
    Then I see iPhone and iPad installation steps

  Scenario: An installed copy can study while offline
    When the app has been prepared for offline use
    And I disconnect the browser from the network
    And I reload the app
    And I start studying
    Then study question 1 of 310 is shown
    When I select study answer "D"
    Then study answer "D" is marked correct
    When I open progress
    And I open question 21 from progress
    Then the study question illustration is visible

  Scenario Outline: Core study controls fit mobile viewports
    Given the viewport is <width> by <height> pixels
    When I start studying
    Then study question 1 of 310 is shown
    And the page has no horizontal overflow
    And the study answer controls are usable by touch

    Examples:
      | width | height |
      | 390   | 844    |
      | 820   | 1180   |
