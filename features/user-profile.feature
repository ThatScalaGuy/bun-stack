Feature: User Profile Management
  As a registered user
  I want to view and edit my profile information
  So that I can keep my details up to date

  Scenario: User views their profile
    Given the user is logged in
    When they navigate to the profile page
    Then they should see their current profile details

  Scenario: User updates their profile information
    Given the user is on their profile page
    When they edit their profile information
    And they save the changes
    Then the profile should be updated with the new information
    And they should see a success message

  Scenario: User attempts to update profile with invalid data
    Given the user is on their profile page
    When they enter invalid information in a field
    And they save the changes
    Then they should see validation error messages
    And the profile should not be updated

  Scenario: User encounters a server error during profile update
    Given the user is on their profile page
    When they edit their profile information
    And they save the changes
    And the server encounters an error processing the request
    Then they should see a server error message
    And they should be able to try again

  Scenario: User attempts to upload an invalid profile picture
    Given the user is on their profile page
    When they try to upload a profile picture with invalid format or size
    Then they should see a file validation error message
    And the profile picture should not be updated
