# Filters, searches, sorts and paginates employees for the list screen.
# Keeps the controller thin and makes the rules unit-testable.
class EmployeesQuery
  SORTABLE_COLUMNS = %w[full_name salary hired_on country job_title department].freeze
  DEFAULT_SORT = "full_name".freeze
  DEFAULT_PER_PAGE = 25
  MAX_PER_PAGE = 100
  FILTERS = %i[country department job_title].freeze

  Result = Data.define(:records, :total, :page, :per_page) do
    def total_pages = (total.to_f / per_page).ceil
  end

  def initialize(params = {}, relation: Employee.all)
    @params = params.to_h.symbolize_keys
    @relation = relation
  end

  def call
    scope = search(filter(@relation))
    total = scope.count
    records = scope.order(sort_column => sort_direction, id: :asc)
                   .limit(per_page)
                   .offset((page - 1) * per_page)

    Result.new(records: records.to_a, total: total, page: page, per_page: per_page)
  end

  private

  def filter(scope)
    FILTERS.reduce(scope) do |current, key|
      value = @params[key].presence
      value ? current.where(key => value) : current
    end
  end

  def search(scope)
    term = @params[:q].to_s.strip
    return scope if term.empty?

    pattern = "%#{Employee.sanitize_sql_like(term.downcase)}%"
    scope.where("LOWER(full_name) LIKE :pattern ESCAPE '\\' OR email LIKE :pattern ESCAPE '\\'",
                pattern: pattern)
  end

  def page
    [@params[:page].to_i, 1].max
  end

  def per_page
    requested = @params[:per_page].to_i
    requested.positive? ? [requested, MAX_PER_PAGE].min : DEFAULT_PER_PAGE
  end

  def sort_column
    SORTABLE_COLUMNS.include?(@params[:sort].to_s) ? @params[:sort].to_s : DEFAULT_SORT
  end

  def sort_direction
    @params[:direction].to_s.downcase == "desc" ? :desc : :asc
  end
end
