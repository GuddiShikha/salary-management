module Api
  module V1
    class InsightsController < ApplicationController
      def overview
        render json: { data: SalaryInsights.new.overview }
      end

      def country
        name = params.require(:country)
        stats = SalaryInsights.new.country(name)

        if stats
          render json: { data: stats }
        else
          render json: { error: "No employees found in #{name}" }, status: :not_found
        end
      end
    end
  end
end
