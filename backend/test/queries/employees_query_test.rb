require "test_helper"

class EmployeesQueryTest < ActiveSupport::TestCase
  setup do
    @asha  = create_employee(full_name: "Asha Rao", country: "India", department: "Engineering",
                             job_title: "Software Engineer", salary: 1_800_000)
    @ben   = create_employee(full_name: "Ben Carter", country: "United States", department: "Sales",
                             job_title: "Account Executive", salary: 90_000)
    @chloe = create_employee(full_name: "Chloe Martin", country: "United States", department: "Engineering",
                             job_title: "Software Engineer", salary: 150_000, email: "chloe@acme.example")
  end

  test "returns all employees sorted by name by default" do
    result = EmployeesQuery.new.call

    assert_equal [@asha, @ben, @chloe], result.records
    assert_equal 3, result.total
  end

  test "filters by country, department and job title together" do
    result = EmployeesQuery.new({ country: "United States", department: "Engineering",
                                job_title: "Software Engineer" }).call

    assert_equal [@chloe], result.records
  end

  test "ignores blank filters" do
    assert_equal 3, EmployeesQuery.new({ country: "", department: nil }).call.total
  end

  test "searches name and email case-insensitively" do
    assert_equal [@ben], EmployeesQuery.new({ q: "CARTER" }).call.records
    assert_equal [@chloe], EmployeesQuery.new({ q: "chloe@" }).call.records
  end

  test "treats LIKE wildcards in the search term literally" do
    assert_empty EmployeesQuery.new({ q: "%" }).call.records
  end

  test "sorts by an allowed column and direction" do
    result = EmployeesQuery.new({ sort: "salary", direction: "desc" }).call

    assert_equal [@asha, @chloe, @ben], result.records
  end

  test "falls back to the default sort for unknown columns" do
    result = EmployeesQuery.new({ sort: "id; DROP TABLE employees", direction: "sideways" }).call

    assert_equal [@asha, @ben, @chloe], result.records
  end

  test "paginates and reports totals" do
    result = EmployeesQuery.new({ page: 2, per_page: 2 }).call

    assert_equal [@chloe], result.records
    assert_equal 3, result.total
    assert_equal 2, result.total_pages
  end

  test "clamps page and per_page to sane values" do
    result = EmployeesQuery.new({ page: -5, per_page: 10_000 }).call

    assert_equal 1, result.page
    assert_equal EmployeesQuery::MAX_PER_PAGE, result.per_page
  end
end
