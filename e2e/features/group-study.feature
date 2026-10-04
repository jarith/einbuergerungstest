Feature: Study question groups and see their progress
  Background:
    Given a learner has no saved history

  Scenario: The group catalog describes every available group
    Then the group catalog includes every group with its description and question count

  Scenario: A chosen group follows question-bank order without other groups' questions
    When I choose the "Constitution, rights, and democratic principles" group
    Then question 1 is the current group question
    When I select study answer "D"
    Then the study answer is correct
    When I go to the next study question
    Then question 3 is the current group question
    When I go to the previous study question
    Then question 1 is the current group question
    And the study answer is correct
    When I choose the "Constitution, rights, and democratic principles" group
    And I select study answer "A"
    Then the study answer is incorrect and identifies the correct option

  Scenario: A group finishes after its final question
    When I choose the "Berlin’s geography, symbols, and government" group
    And I answer and advance through the Berlin group to its final question
    Then question 310 is the current group question
    When I select study answer "C"
    And I finish the group
    Then the group pass is completed
    When I restart with my saved history
    Then the group pass is completed
    When I review the completed group
    Then question 301 is the current group question
    And the current study question has no session answer or feedback
    And question 301 has status "learning"
    And question 301 has 1 recorded attempt
    When I choose the "Berlin’s geography, symbols, and government" group
    And I select study answer "A"
    Then question 301 has 2 recorded attempts

  Scenario: Each group remembers its own study position
    When I choose the "Constitution, rights, and democratic principles" group
    And I select study answer "D"
    And I go to the next study question
    Then question 3 is the current group question
    When I choose the "Berlin’s geography, symbols, and government" group
    Then question 301 is the current group question
    When I choose the "Constitution, rights, and democratic principles" group
    Then question 3 is the current group question

  Scenario: Every group starts at zero and group study updates the overall total
    Then every question group has zero progress
    When I choose the "Constitution, rights, and democratic principles" group
    And I select study answer "D"
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent
    And overall progress is 1 of 310 questions contributing to progress and 0 percent
    When I restart with my saved history
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent

  Scenario: All-question study shares the learning status with group progress
    When I start a new all-question study session
    And I select study answer "D"
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent
    When I start a new study session at question 1
    And I select study answer "A"
    Then the "Constitution, rights, and democratic principles" group shows 0 of 27 contributing to progress and 0 percent
    And overall progress is 0 of 310 questions contributing to progress and 0 percent

  Scenario: A completed mock answer updates its question group
    When I start a mock test
    And I remember the first mock question
    And I answer the first mock question correctly
    And I confirm submitting the mock with unanswered questions
    Then the noted mock question's group shows one question contributing to progress

  Scenario: Group descriptions follow the preferred language
    When I choose German as my preferred language
    Then the Constitution and rights group has a German title and description
