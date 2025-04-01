Feature: Email Notifications
  As a user
  I want to receive email notifications for important events
  So that I can stay informed about account activity

  Scenario: Password reset email
    Given a user has requested a password reset
    When the system processes the request
    Then an email with reset instructions should be sent to the user
    And the email should contain a valid reset link

  Scenario: Account activity notification
    Given a user has enabled notifications
    When there is unusual activity on their account
    Then a notification email should be sent to the user
    And the email should contain details about the activity

  Scenario: System fails to send email notification
    Given a user should receive a notification email
    When the email delivery system encounters an error
    Then the system should log the failure
    And attempt to retry sending the email
    And alert system administrators of the issue

  Scenario: User has an invalid email address
    Given a user has an invalid email address in their profile
    When the system attempts to send them a notification
    Then the system should detect the bounced email
    And mark the user's email as requiring verification
    And notify the user through alternative channels if available

  Scenario: User attempts to unsubscribe with invalid token
    Given a user received a notification email with unsubscribe link
    When they click the unsubscribe link with a tampered or expired token
    Then they should see an error message
    And their notification preferences should remain unchanged
