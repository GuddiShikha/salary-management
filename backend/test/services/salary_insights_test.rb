require "test_helper"

class SalaryInsightsTest < ActiveSupport::TestCase
  setup do
    create_employee(country: "India", job_title: "Software Engineer", department: "Engineering", salary: 1_000_000)
    create_employee(country: "India", job_title: "Software Engineer", department: "Engineering", salary: 2_000_000)
    create_employee(country: "India", job_title: "Recruiter", department: "People", salary: 600_000)
    create_employee(country: "United States", job_title: "Software Engineer", department: "Engineering", salary: 100_000)
    create_employee(country: "United States", job_title: "Recruiter", department: "People", salary: 70_000)
  end

  test "overview reports org headcount and per-country stats in local currency" do
    overview = SalaryInsights.new.overview

    assert_equal 5, overview[:total_headcount]
    assert_equal 2, overview[:country_count]

    india, us = overview[:countries]
    assert_equal({ country: "India", currency: "INR", headcount: 3,
                   min_salary: 600_000.0, max_salary: 2_000_000.0,
                   avg_salary: 1_200_000.0, median_salary: 1_000_000.0 }, india)
    assert_equal "United States", us[:country]
    assert_equal 85_000.0, us[:avg_salary]
    assert_equal 85_000.0, us[:median_salary], "median of an even count averages the middle two"
  end

  test "country breakdown includes job title and department stats ordered by average pay" do
    stats = SalaryInsights.new.country("India")

    assert_equal 3, stats[:headcount]
    assert_equal "INR", stats[:currency]
    assert_equal [
      { name: "Software Engineer", headcount: 2, min_salary: 1_000_000.0,
        max_salary: 2_000_000.0, avg_salary: 1_500_000.0 },
      { name: "Recruiter", headcount: 1, min_salary: 600_000.0,
        max_salary: 600_000.0, avg_salary: 600_000.0 }
    ], stats[:by_job_title]
    assert_equal %w[Engineering People], stats[:by_department].map { |row| row[:name] }
  end

  test "country returns nil when nobody works there" do
    assert_nil SalaryInsights.new.country("Brazil")
  end

  test "overview is empty but well-formed with no employees" do
    Employee.delete_all

    assert_equal({ total_headcount: 0, country_count: 0, countries: [] }, SalaryInsights.new.overview)
  end
end
