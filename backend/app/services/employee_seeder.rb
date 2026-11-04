# Generates a realistic, deterministic workforce for demos and performance checks.
#
# Uses insert_all in batches: ~10k rows in a couple of seconds instead of
# ~10k individual INSERTs with callbacks. Rows are built from controlled data,
# so skipping model validations here is safe (and covered by a test).
class EmployeeSeeder
  DATA_DIR = Rails.root.join("db/seed_data")
  BATCH_SIZE = 1_000
  EARLIEST_HIRE_DATE = Date.new(2012, 1, 1)

  # Annual salary bands in USD; converted per country via Countries.salary_factor.
  JOB_CATALOG = {
    "Engineering" => {
      "Software Engineer" => [70_000, 120_000],
      "Senior Software Engineer" => [110_000, 170_000],
      "Engineering Manager" => [150_000, 220_000],
      "QA Engineer" => [55_000, 95_000],
      "DevOps Engineer" => [80_000, 140_000]
    },
    "Product" => {
      "Product Manager" => [100_000, 170_000],
      "Product Designer" => [75_000, 130_000]
    },
    "Sales" => {
      "Account Executive" => [60_000, 110_000],
      "Sales Manager" => [90_000, 150_000]
    },
    "Marketing" => {
      "Marketing Specialist" => [50_000, 85_000],
      "Content Strategist" => [55_000, 90_000]
    },
    "People" => {
      "HR Generalist" => [50_000, 80_000],
      "Recruiter" => [50_000, 85_000]
    },
    "Finance" => {
      "Accountant" => [55_000, 90_000],
      "Financial Analyst" => [65_000, 110_000]
    },
    "Operations" => {
      "Operations Analyst" => [50_000, 85_000],
      "Customer Support Specialist" => [35_000, 60_000]
    }
  }.freeze

  # Relative headcount per country.
  COUNTRY_WEIGHTS = {
    "United States" => 28, "India" => 30, "United Kingdom" => 10, "Germany" => 8,
    "Canada" => 7, "Australia" => 5, "Singapore" => 5, "Brazil" => 7
  }.freeze

  ROLES = JOB_CATALOG.flat_map do |department, titles|
    titles.map { |title, band| { department: department, job_title: title, band: band } }
  end.freeze

  def self.read_names(file)
    DATA_DIR.join(file).readlines(chomp: true).map(&:strip).reject(&:empty?)
  end

  def initialize(count: 10_000, seed: 42,
                 first_names: self.class.read_names("first_names.txt"),
                 last_names: self.class.read_names("last_names.txt"))
    @count = count
    @random = Random.new(seed)
    @first_names = first_names
    @last_names = last_names
    @weighted_countries = COUNTRY_WEIGHTS.flat_map { |country, weight| [country] * weight }
  end

  # Replaces all employees. Returns the number of rows inserted.
  def call
    timestamp = Time.current
    Employee.transaction do
      Employee.delete_all
      @count.times.each_slice(BATCH_SIZE) do |indexes|
        Employee.insert_all!(indexes.map { |index| build_row(index, timestamp) })
      end
    end
    @count
  end

  private

  def build_row(index, timestamp)
    first_name = pick(@first_names)
    last_name = pick(@last_names)
    country = pick(@weighted_countries)
    role = pick(ROLES)

    {
      full_name: "#{first_name} #{last_name}",
      email: email_for(first_name, last_name, index),
      job_title: role[:job_title],
      department: role[:department],
      country: country,
      currency: Countries.currency_for(country),
      salary: salary_for(role[:band], country),
      hired_on: EARLIEST_HIRE_DATE + @random.rand((Date.current - EARLIEST_HIRE_DATE).to_i),
      created_at: timestamp,
      updated_at: timestamp
    }
  end

  # The index suffix guarantees uniqueness even when name pairs repeat.
  def email_for(first_name, last_name, index)
    local = [first_name, last_name].map { |part| part.downcase.gsub(/[^a-z]/, "") }.join(".")
    "#{local}.#{index + 1}@acme.example"
  end

  def salary_for((min, max), country)
    usd = @random.rand(min..max)
    BigDecimal((usd * Countries.salary_factor(country)).round(-2).to_s)
  end

  def pick(list)
    list[@random.rand(list.size)]
  end
end
