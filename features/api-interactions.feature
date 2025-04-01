Feature: API Interactions
  As a developer
  I want to interact with the system's API
  So that I can build integrations and extensions

  Scenario: Fetch user data via API
    Given a valid API token
    When a GET request is made to the user endpoint
    Then the API should return user data in JSON format

  Scenario: Create a resource via API
    Given a valid API token
    When a POST request is made to a resource endpoint with valid data
    Then a new resource should be created
    And the API should return a success response

  Scenario: API request with invalid authentication
    Given an invalid or expired API token
    When a request is made to a protected endpoint
    Then the API should return a 401 Unauthorized status code
    And the response should include an appropriate error message

  Scenario: API request with insufficient permissions
    Given a valid API token with insufficient permissions
    When a request is made to a restricted endpoint
    Then the API should return a 403 Forbidden status code
    And the response should include a permissions error message

  Scenario: API request with invalid data format
    Given a valid API token
    When a POST request is made with malformed JSON data
    Then the API should return a 400 Bad Request status code
    And the response should include validation error details

  Scenario: API rate limiting
    Given a client that exceeds the allowed request rate
    When multiple requests are made in rapid succession
    Then the API should return a 429 Too Many Requests status code
    And the response should include rate limiting information and retry guidance
