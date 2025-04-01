Feature: Admin Dashboard
  As an administrator
  I want to manage users and system settings
  So that I can maintain the system effectively

  Scenario: Admin views all users
    Given the admin is logged in
    When they navigate to the user management page
    Then they should see a list of all users

  Scenario: Admin assigns a role to a user
    Given the admin is on the user management page
    When they select a user
    And they assign a new role to the user
    Then the user's role should be updated
    And the change should be reflected in the system

  Scenario: Non-admin user attempts to access admin dashboard
    Given a regular user is logged in
    When they try to navigate to the admin dashboard
    Then they should see an access denied message
    And they should be redirected to their user dashboard

  Scenario: Admin attempts to assign an invalid role
    Given the admin is on the user management page
    When they select a user
    And they attempt to assign an invalid role to the user
    Then they should see a role validation error message
    And the user's role should remain unchanged

  Scenario: Admin encounters a database error during user management
    Given the admin is on the user management page
    When they try to perform an action on a user
    And the database operation fails
    Then they should see a database error message
    And the system should offer recovery options
