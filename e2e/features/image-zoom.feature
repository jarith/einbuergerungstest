Feature: Inspect question illustrations without moving the viewer controls
  Scenario Outline: Images fit the screen and zoom inside a stable full-screen viewer
    Given I open the app with a fresh learner profile
    When I view question <question> at <width> by <height>
    Then the inline question image fits its desktop height limit
    When I enlarge the question image
    Then every zoom level keeps the image viewer and its controls in place
    And I can close the image viewer and return to its trigger

    Examples:
      | question | width | height |
      | 308      | 1440  | 900    |
      | 21       | 1440  | 900    |
      | 308      | 390   | 844    |
      | 308      | 844   | 390    |
