Feature: User Authentication
  As a user
  I want to be able to sign up, log in, and log out
  So that I can access my account securely

  Scenario: User signs up with valid details
    Given the user is on the signup page
    When they enter valid email and password
    And they submit the form
    Then a new account should be created
    And they should be redirected to the dashboard

  Scenario: User logs in with valid credentials
    Given the user is on the login page
    When they enter valid email and password
    And they submit the form
    Then they should be authenticated
    And they should be redirected to the dashboard

  Scenario: User logs out
    Given the user is logged in
    When they click the logout button
    Then they should be logged out
    And they should be redirected to the home page

  Scenario: User attempts to sign up with invalid email format
    Given the user is on the signup page
    When they enter an invalid email format
    And they submit the form
    Then they should see an email validation error message
    And the form should not be submitted

  Scenario: User attempts to sign up with a weak password
    Given the user is on the signup page
    When they enter a password that doesn't meet the strength requirements
    And they submit the form
    Then they should see a password strength error message
    And the form should not be submitted

  Scenario: User attempts to log in with incorrect credentials
    Given the user is on the login page
    When they enter an incorrect email or password
    And they submit the form
    Then they should see an authentication error message
    And they should remain on the login page

  Scenario: User attempts to access protected resources without authentication
    Given the user is not logged in
    When they try to access a protected resource
    Then they should be redirected to the login page
    And they should see a message indicating they need to log in
