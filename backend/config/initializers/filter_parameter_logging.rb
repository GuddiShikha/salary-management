# Salaries are sensitive: keep them out of the logs.
Rails.application.config.filter_parameters += %i[salary email]
