Feature: Study the Berlin question bank in order
  Background:
    Given I open the app with a fresh learner profile
    And I choose German as UI language

  Scenario: A wrong answer reveals the correct choice and records a mistake
    When I start studying
    Then study question 1 of 310 is shown
    When I select study answer "A"
    Then study answer "A" is marked wrong
    And study answer "D" is marked correct
    And I see immediate incorrect feedback
    When I open progress
    Then question 1 has status "needs-review"
    And the question totals are 309 not started, 1 needing review, 0 learning, and 0 learned

  Scenario: A new study session allows another attempt and retains the mistake
    When I start studying
    And I select study answer "A"
    And I resume studying
    And I select study answer "D"
    Then study answer "D" is marked correct
    And I see immediate correct feedback
    When I open progress
    Then question 1 has status "learning"
    And question 1 has 2 recorded attempts

  Scenario: Translation shows both languages and remains enabled
    When I choose English as UI language
    And I start studying
    And I enable English translation
    Then German and English text for study question 1 and its options are visible
    When I go to the next study question
    Then study question 2 of 310 is shown
    And German and English text for study question 2 and its options are visible
    When I reload the app
    And I resume studying
    Then German and English text for study question 2 and its options are visible

  Scenario: Navigation preserves feedback and opening from Progress allows a fresh answer
    When I start studying
    And I select study answer "A"
    And I go to the next study question
    And I go to the previous study question
    Then study answer "A" is marked wrong
    When I open progress
    And I open question 1 from progress
    Then study question 1 of 310 is shown
    When I select study answer "D"
    Then study answer "D" is marked correct
    When I open progress
    Then question 1 has status "learning"
    And question 1 has 2 recorded attempts

  Scenario: An illustrated question displays its embedded picture
    When I open progress
    And I open question 21 from progress
    Then study question 21 of 310 is shown
    And the study question illustration is visible

  Scenario Outline: Study help is accessible without losing an answer
    Given the browser viewport is <width> by 844
    When I choose <language> as UI language
    And I start studying
    And I select study answer "A"
    And I open and close study help with the keyboard
    Then study question 1 of 310 is shown
    And study answer "A" is marked wrong
    And I see immediate incorrect feedback
    And the application fits the viewport width

    Examples:
      | language | width |
      | English  | 390   |
      | German   | 1440  |
