class Employee < ApplicationRecord
  MAX_SALARY = 10_000_000_000

  before_validation :normalize_attributes
  before_validation :assign_currency

  validates :full_name, :job_title, :department, :hired_on, presence: true
  validates :full_name, length: { maximum: 120 }
  validates :email, presence: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true },
                    uniqueness: { case_sensitive: false }
  validates :country, inclusion: { in: ->(_) { Countries.names }, message: "is not supported" }
  validates :salary, presence: true,
                     numericality: { greater_than: 0, less_than: MAX_SALARY, allow_nil: true }
  validate :hired_on_cannot_be_in_the_future

  private

  def normalize_attributes
    self.full_name = full_name&.squish
    self.email = email&.strip&.downcase
    self.job_title = job_title&.squish
    self.department = department&.squish
  end

  # Currency is derived, never user-entered, so it can't drift from the country.
  def assign_currency
    self.currency = Countries.currency_for(country)
  end

  def hired_on_cannot_be_in_the_future
    return if hired_on.blank? || hired_on <= Date.current

    errors.add(:hired_on, "can't be in the future")
  end
end
