require "test_helper"

class EmployeesApiTest < ActionDispatch::IntegrationTest
  test "GET /api/v1/employees returns a page of employees with meta" do
    create_employee(full_name: "Asha Rao")
    create_employee(full_name: "Ben Carter")

    get "/api/v1/employees", params: { per_page: 1 }

    assert_response :ok
    assert_equal 1, json["data"].size
    assert_equal "Asha Rao", json["data"].first["full_name"]
    assert_equal({ "page" => 1, "per_page" => 1, "total" => 2, "total_pages" => 2 }, json["meta"])
  end

  test "GET /api/v1/employees/:id returns the employee with numeric salary" do
    employee = create_employee(salary: "120000.50")

    get "/api/v1/employees/#{employee.id}"

    assert_response :ok
    assert_equal 120_000.5, json.dig("data", "salary")
    assert_equal "INR", json.dig("data", "currency")
  end

  test "GET an unknown employee returns 404" do
    get "/api/v1/employees/999999"

    assert_response :not_found
  end

  test "POST creates an employee" do
    assert_difference("Employee.count", 1) do
      post "/api/v1/employees", params: { employee: employee_attributes(country: "Canada") }, as: :json
    end

    assert_response :created
    assert_equal "CAD", json.dig("data", "currency")
  end

  test "POST with invalid data returns field errors" do
    post "/api/v1/employees", params: { employee: { full_name: "", country: "Atlantis" } }, as: :json

    assert_response :unprocessable_content
    assert_includes json.dig("errors", "full_name"), "can't be blank"
    assert_includes json.dig("errors", "country"), "is not supported"
  end

  test "POST without an employee payload returns 400" do
    post "/api/v1/employees", params: {}, as: :json

    assert_response :bad_request
  end

  test "PATCH updates an employee" do
    employee = create_employee

    patch "/api/v1/employees/#{employee.id}", params: { employee: { salary: 2_000_000 } }, as: :json

    assert_response :ok
    assert_equal 2_000_000, employee.reload.salary
  end

  test "PATCH with invalid data returns 422 and leaves the record unchanged" do
    employee = create_employee(salary: 500)

    patch "/api/v1/employees/#{employee.id}", params: { employee: { salary: -1 } }, as: :json

    assert_response :unprocessable_content
    assert_equal 500, employee.reload.salary
  end

  test "DELETE removes the employee" do
    employee = create_employee

    assert_difference("Employee.count", -1) do
      delete "/api/v1/employees/#{employee.id}"
    end

    assert_response :no_content
  end
end
