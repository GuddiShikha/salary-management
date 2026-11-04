module Api
  module V1
    # Option lists for the UI's filters and form dropdowns.
    class MetaController < ApplicationController
      def show
        render json: {
          data: {
            countries: Countries.all.map { |country| { name: country.name, currency: country.currency } },
            departments: Employee.distinct.order(:department).pluck(:department),
            job_titles: Employee.distinct.order(:job_title).pluck(:job_title)
          }
        }
      end
    end
  end
end
