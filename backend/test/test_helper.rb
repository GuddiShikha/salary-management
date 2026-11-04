ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module EmployeeFactory
  def employee_attributes(overrides = {})
    @employee_sequence = (@employee_sequence || 0) + 1
    {
      full_name: "Test Person #{@employee_sequence}",
      email: "person#{@employee_sequence}@acme.example",
      job_title: "Software Engineer",
      department: "Engineering",
      country: "India",
      salary: 1_000_000,
      hired_on: Date.new(2020, 1, 15)
    }.merge(overrides)
  end

  def create_employee(overrides = {})
    Employee.create!(employee_attributes(overrides))
  end
end

module ActiveSupport
  class TestCase
    include EmployeeFactory
  end
end

class ActionDispatch::IntegrationTest
  def json
    JSON.parse(response.body)
  end
end
