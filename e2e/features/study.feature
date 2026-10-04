Feature: Study the Berlin question bank in order
  Background:
    Given a learner has no saved history
    When I choose German as my preferred language

  Scenario: A wrong answer reveals the correct choice and records a mistake
    When I start a new all-question study session
    Then the current study question is 1 of 310
    When I select study answer "A"
    Then the study answer is incorrect and identifies the correct option
    And the correct study option is "D"
    And question 1 has status "needs-review"
    And the question totals are 309 not started, 1 needing review, 0 learning, and 0 learned

  Scenario: A new study session allows another attempt and retains the mistake
    When I start a new all-question study session
    And I select study answer "A"
    And I start a new all-question study session
    And I select study answer "D"
    Then the study answer is correct
    And question 1 has status "learning"
    And question 1 has 2 recorded attempts

  Scenario: Translation shows both languages and remains enabled
    When I choose English as my preferred language
    And I start a new all-question study session
    And I enable English translation
    Then German and English content for study question 1 and its options is available
    When I go to the next study question
    Then the current study question is 2 of 310
    And German and English content for study question 2 and its options is available
    When I restart with my saved history
    And I start a new all-question study session
    Then German and English content for study question 2 and its options is available

  Scenario: Question navigation preserves feedback and a new session permits another answer
    When I start a new all-question study session
    And I select study answer "A"
    And I go to the next study question
    And I go to the previous study question
    Then the study answer is incorrect and identifies the correct option
    When I start a new study session at question 1
    Then the current study question is 1 of 310
    When I select study answer "D"
    Then the study answer is correct
    And question 1 has status "learning"
    And question 1 has 2 recorded attempts

  Scenario: An illustrated question includes its picture
    When I start a new study session at question 21
    Then the current study question is 21 of 310
    And the study question includes its illustration

  Scenario: Consecutive correct answers become Learned without counting a question twice
    When I start a new all-question study session
    And I select study answer "D"
    And I start a new all-question study session
    And I select study answer "D"
    Then this answer is the transition to Learned
    And question 1 has status "learned"
    And question 1 has 2 recorded attempts
    And the question totals are 309 not started, 0 needing review, 0 learning, and 1 learned
    And overall progress is 1 of 310 questions contributing to progress and 0 percent
    When I choose English as my preferred language
    Then the "Constitution, rights, and democratic principles" group shows 1 of 27 contributing to progress and 4 percent
    When I start a new all-question study session
    And I select study answer "D"
    Then this correct answer is not a new transition to Learned
    And overall progress is 1 of 310 questions contributing to progress and 0 percent
    When I start a new all-question study session
    And I select study answer "A"
    Then question 1 has status "needs-review"
    And overall progress is 0 of 310 questions contributing to progress and 0 percent
    When I start a new all-question study session
    And I select study answer "D"
    Then question 1 has status "learning"
    And question 1 has 5 recorded attempts
    And the question totals are 309 not started, 0 needing review, 1 learning, and 0 learned

  Scenario: Restarting clears session answers but retains position, status, and history
    When I start a new all-question study session
    And I select study answer "D"
    And I go to the next study question
    And I select study answer "A"
    And I restart with my saved history
    Then the current study question is 2 of 310
    And the current study question has no session answer or feedback
    When I go to the previous study question
    Then the current study question is 1 of 310
    And the current study question has no session answer or feedback
    When I select study answer "D"
    Then this answer is the transition to Learned
    And question 1 has status "learned"
    And question 1 has 2 recorded attempts
    And question 2 has status "needs-review"
    And question 2 has 1 recorded attempt

  Scenario: A question accepts only one answer in a study session
    When I start a new all-question study session
    And I select study answer "A"
    And I select study answer "D"
    Then the study answer is incorrect and identifies the correct option
    And question 1 has 1 recorded attempt
    And question 1 has status "needs-review"
