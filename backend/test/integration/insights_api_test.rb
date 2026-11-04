require "test_helper"

class InsightsApiTest < ActionDispatch::IntegrationTest
  setup do
    create_employee(country: "Germany", job_title: "Accountant", department: "Finance", salary: 60_000)
    create_employee(country: "Germany", job_title: "Accountant", department: "Finance", salary: 80_000)
  end

  test "GET overview" do
    get "/api/v1/insights/overview"

    assert_response :ok
    assert_equal 2, json.dig("data", "total_headcount")
    assert_equal 70_000.0, json.dig("data", "countries", 0, "avg_salary")
  end

  test "GET country" do
    get "/api/v1/insights/country", params: { country: "Germany" }

    assert_response :ok
    assert_equal "EUR", json.dig("data", "currency")
    assert_equal "Accountant", json.dig("data", "by_job_title", 0, "name")
  end

  test "GET country with no employees returns 404" do
    get "/api/v1/insights/country", params: { country: "Brazil" }

    assert_response :not_found
  end

  test "GET country without a country param returns 400" do
    get "/api/v1/insights/country"

    assert_response :bad_request
  end

  test "GET meta lists countries with currency and existing departments and titles" do
    get "/api/v1/meta"

    assert_response :ok
    assert_includes json.dig("data", "countries"), { "name" => "India", "currency" => "INR" }
    assert_equal ["Finance"], json.dig("data", "departments")
    assert_equal ["Accountant"], json.dig("data", "job_titles")
  end
end
