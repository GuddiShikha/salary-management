# Usage: bin/rails db:seed            (10,000 employees)
#        SEED_COUNT=500 bin/rails db:seed
count = Integer(ENV.fetch("SEED_COUNT", 10_000))
started = Process.clock_gettime(Process::CLOCK_MONOTONIC)

EmployeeSeeder.new(count: count).call

elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
puts format("Seeded %<count>d employees in %<elapsed>.2fs", count: count, elapsed: elapsed)
