# Production image for the Rails API (SQLite stored on a mounted volume at /rails/storage).
FROM ruby:3.3-slim

WORKDIR /rails
ENV RAILS_ENV=production BUNDLE_WITHOUT="development:test" BUNDLE_DEPLOYMENT=0

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libyaml-dev sqlite3 && \
    rm -rf /var/lib/apt/lists/*

COPY Gemfile Gemfile.lock* ./
RUN bundle install

COPY . .

EXPOSE 3000
# Prepare the DB and seed only when empty, then start Puma.
CMD ["bash", "-c", "bin/rails db:prepare && bin/rails runner 'EmployeeSeeder.new.call if Employee.none?' && bundle exec puma -C config/puma.rb"]
