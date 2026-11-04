require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  test "is valid with complete attributes" do
    assert Employee.new(employee_attributes).valid?
  end

  test "derives currency from country" do
    employee = create_employee(country: "Germany")

    assert_equal "EUR", employee.currency
  end

  test "updates currency when country changes" do
    employee = create_employee(country: "India")
    employee.update!(country: "United Kingdom")

    assert_equal "GBP", employee.reload.currency
  end

  test "requires the core fields" do
    employee = Employee.new

    assert_not employee.valid?
    %i[full_name email job_title department hired_on salary].each do |field|
      assert_includes employee.errors[field], "can't be blank", "expected #{field} to be required"
    end
  end

  test "rejects an unsupported country" do
    employee = Employee.new(employee_attributes(country: "Atlantis"))

    assert_not employee.valid?
    assert_includes employee.errors[:country], "is not supported"
  end

  test "rejects a non-positive salary" do
    [0, -1].each do |salary|
      employee = Employee.new(employee_attributes(salary: salary))

      assert_not employee.valid?, "salary #{salary} should be invalid"
      assert_includes employee.errors[:salary], "must be greater than 0"
    end
  end

  test "rejects a malformed email" do
    employee = Employee.new(employee_attributes(email: "not-an-email"))

    assert_not employee.valid?
    assert_includes employee.errors[:email], "is invalid"
  end

  test "normalizes email and enforces case-insensitive uniqueness" do
    create_employee(email: "Asha.Rao@ACME.example")
    duplicate = Employee.new(employee_attributes(email: "  asha.rao@acme.example "))

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "squishes whitespace in names" do
    employee = create_employee(full_name: "  Asha    Rao ")

    assert_equal "Asha Rao", employee.full_name
  end

  test "rejects a hire date in the future" do
    employee = Employee.new(employee_attributes(hired_on: Date.current + 1))

    assert_not employee.valid?
    assert_includes employee.errors[:hired_on], "can't be in the future"
  end

  test "stores salary as an exact decimal" do
    employee = create_employee(salary: "123456.78")

    assert_equal BigDecimal("123456.78"), employee.reload.salary
  end
end
