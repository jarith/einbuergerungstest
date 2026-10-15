Feature: Retain learning when question groups change
  Scenario Outline: Existing answers contribute to the new groups automatically
    Given a learner has saved answers and a mock test from the previous question groups
    When <restore>
    Then the "Fundamental rights" group shows 2 of 20 contributing to progress and 10 percent
    And the "The rule of law and courts" group shows 1 of 21 contributing to progress and 5 percent
    And the "Reunification" group shows 1 of 7 contributing to progress and 14 percent
    And the "Symbols, holidays, and culture" group shows 0 of 13 contributing to progress and 0 percent
    And overall progress is 4 of 310 questions contributing to progress and 1 percent
    And question 3 has status "learned"
    And question 3 has 2 recorded attempts
    And question 21 has status "needs-review"
    And question 2 has 1 recorded attempt
    And the original answer history and mock paper are preserved
    When I restart with my saved history
    Then overall progress is 4 of 310 questions contributing to progress and 1 percent
    And question 3 has status "learned"
    When I choose the "The rule of law and courts" group
    Then question 3 is the current group question

    Examples:
      | restore                                            |
      | I open the app after the question groups change     |
      | I import my backup from the previous question groups |
