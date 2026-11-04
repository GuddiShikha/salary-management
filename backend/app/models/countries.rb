# Single source of truth for the countries ACME operates in.
#
# salary_factor converts a USD-denominated salary band into a realistic local
# salary (FX rate x local market level). It is only used to generate seed data;
# the app never converts between currencies.
module Countries
  Country = Data.define(:name, :currency, :salary_factor)

  ALL = [
    Country.new(name: "United States",  currency: "USD", salary_factor: 1.0),
    Country.new(name: "India",          currency: "INR", salary_factor: 25.0),
    Country.new(name: "United Kingdom", currency: "GBP", salary_factor: 0.62),
    Country.new(name: "Germany",        currency: "EUR", salary_factor: 0.75),
    Country.new(name: "Canada",         currency: "CAD", salary_factor: 1.05),
    Country.new(name: "Australia",      currency: "AUD", salary_factor: 1.2),
    Country.new(name: "Singapore",      currency: "SGD", salary_factor: 1.0),
    Country.new(name: "Brazil",         currency: "BRL", salary_factor: 1.6)
  ].freeze

  BY_NAME = ALL.to_h { |country| [country.name, country] }.freeze

  def self.all = ALL
  def self.names = BY_NAME.keys
  def self.currency_for(name) = BY_NAME[name]&.currency
  def self.salary_factor(name) = BY_NAME.fetch(name).salary_factor
end
