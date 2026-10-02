Feature: Study question groups and see their progress
  Background:
    Given I open the app with a fresh learner profile

  Scenario: The picker explains every available group
    When I open group study
    Then the group picker lists every question group with its description and question count

  Scenario: A chosen group follows question-bank order without other groups' questions
    When I open group study
    And I choose the "Constitution, rights, and democratic principles" group
    Then source question 1 is shown in group study
    When I select study answer "D"
    Then I see immediate correct feedback
    When I go to the next study question
    Then source question 3 is shown in group study
    When I go to the previous study question
    Then source question 1 is shown in group study

  Scenario: A group finishes after its final question
    When I open group study
    And I choose the "Berlin’s geography, symbols, and government" group
    And I answer and advance through the Berlin group to its final question
    Then source question 310 is shown in group study
    When I select study answer "C"
    And I finish the group
    Then group study shows completion without another question

  Scenario: Each group remembers its own study position
    When I open group study
    And I choose the "Constitution, rights, and democratic principles" group
    And I select study answer "D"
    And I go to the next study question
    Then source question 3 is shown in group study
    When I open dashboard
    And I open group study
    And I choose the "Berlin’s geography, symbols, and government" group
    Then source question 301 is shown in group study
    When I open dashboard
    And I open group study
    And I choose the "Constitution, rights, and democratic principles" group
    Then source question 3 is shown in group study

  Scenario: Every group starts at zero and group study updates the overall total
    Then the dashboard shows zero progress for every question group
    When I open group study
    And I choose the "Constitution, rights, and democratic principles" group
    And I select study answer "D"
    And I open dashboard
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent
    And the dashboard shows 1 of 310 questions contributing to progress and 0 percent
    When I reload the app
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent

  Scenario: All-question study shares the learning status with group progress
    When I start studying
    And I select study answer "D"
    And I open dashboard
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent
    When I open progress
    And I open question 1 from progress
    And I retry the study question
    And I select study answer "A"
    And I open dashboard
    Then the "Constitution, rights, and democratic principles" group shows 0 of 27 contributing to progress and 0 percent
    And the dashboard shows 0 of 310 questions contributing to progress and 0 percent

  Scenario: A completed mock answer updates its question group
    When I start a mock test
    And I note the first mock question's group
    And I answer the first mock question correctly
    And I submit the mock test with unanswered questions
    And I open dashboard
    Then the noted mock question's group shows one question contributing to progress

  Scenario: The group picker follows the selected UI language
    When I choose German as UI language
    And I open group study
    Then the Constitution and rights group has a German title and description
