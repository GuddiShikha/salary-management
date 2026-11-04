# Answers "how does the org pay people?".
#
# All aggregation runs in SQL so we return a handful of rows, not 10k records.
# Stats are always per country in local currency: averaging INR with USD would
# be meaningless without FX conversion, which is explicitly out of scope.
class SalaryInsights
  STAT_COLUMNS = [
    Arel.sql("COUNT(*)"),
    Arel.sql("MIN(salary)"),
    Arel.sql("MAX(salary)"),
    Arel.sql("AVG(salary)")
  ].freeze

  def initialize(relation = Employee.all)
    @relation = relation
  end

  def overview
    {
      total_headcount: @relation.count,
      country_count: @relation.distinct.count(:country),
      countries: country_stats
    }
  end

  # Returns nil when the country has no employees.
  def country(name)
    scope = @relation.where(country: name)
    headcount, min, max, avg = scope.pick(*STAT_COLUMNS)
    return nil if headcount.to_i.zero?

    {
      country: name,
      currency: Countries.currency_for(name),
      headcount: headcount,
      min_salary: money(min),
      max_salary: money(max),
      avg_salary: money(avg),
      median_salary: money(median(scope)),
      by_job_title: grouped_stats(scope, :job_title),
      by_department: grouped_stats(scope, :department)
    }
  end

  private

  def country_stats
    @relation.group(:country, :currency)
             .order(:country)
             .pluck(:country, :currency, *STAT_COLUMNS)
             .map do |country, currency, headcount, min, max, avg|
               scope = @relation.where(country: country)
               {
                 country: country,
                 currency: currency,
                 headcount: headcount,
                 min_salary: money(min),
                 max_salary: money(max),
                 avg_salary: money(avg),
                 median_salary: money(median(scope))
               }
             end
  end

  def grouped_stats(scope, column)
    scope.group(column)
         .order(Arel.sql("AVG(salary) DESC"), column)
         .pluck(column, *STAT_COLUMNS)
         .map do |name, headcount, min, max, avg|
           {
             name: name,
             headcount: headcount,
             min_salary: money(min),
             max_salary: money(max),
             avg_salary: money(avg)
           }
         end
  end

  # SQLite has no PERCENTILE_CONT, so read the middle one or two rows via the
  # salary index instead of loading every salary into Ruby.
  def median(scope)
    count = scope.count
    return nil if count.zero?

    ordered = scope.reorder(:salary)
    middle =
      if count.odd?
        ordered.offset(count / 2).limit(1).pluck(:salary)
      else
        ordered.offset((count / 2) - 1).limit(2).pluck(:salary)
      end
    middle.sum(BigDecimal("0")) / middle.size
  end

  def money(value)
    value.nil? ? nil : BigDecimal(value.to_s).round(2).to_f
  end
end
