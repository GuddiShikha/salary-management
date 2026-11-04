require "test_helper"

class EmployeeSeederTest < ActiveSupport::TestCase
  test "creates the requested number of employees, replacing existing ones" do
    create_employee

    assert_equal 120, EmployeeSeeder.new(count: 120).call
    assert_equal 120, Employee.count
  end

  test "is deterministic for a given seed" do
    EmployeeSeeder.new(count: 20, seed: 7).call
    first_run = Employee.order(:email).pluck(:full_name, :country, :salary)

    EmployeeSeeder.new(count: 20, seed: 7).call

    assert_equal first_run, Employee.order(:email).pluck(:full_name, :country, :salary)
  end

  test "produces records that pass model validations" do
    EmployeeSeeder.new(count: 200).call

    invalid = Employee.all.reject(&:valid?)
    assert_empty invalid, "invalid seeded rows: #{invalid.first(3).map { |e| e.errors.full_messages }}"
  end

  test "uses the country's currency and keeps salaries within the converted band" do
    EmployeeSeeder.new(count: 300).call

    Employee.find_each do |employee|
      assert_equal Countries.currency_for(employee.country), employee.currency
      role = EmployeeSeeder::ROLES.find { |r| r[:job_title] == employee.job_title }
      factor = Countries.salary_factor(employee.country)
      min, max = role[:band].map { |usd| usd * factor }
      assert_in_delta (min + max) / 2, employee.salary.to_f, ((max - min) / 2) + 100
    end
  end

  test "reads names from the seed data files" do
    assert_operator EmployeeSeeder.read_names("first_names.txt").size, :>=, 50
    assert_operator EmployeeSeeder.read_names("last_names.txt").size, :>=, 50
  end
end
