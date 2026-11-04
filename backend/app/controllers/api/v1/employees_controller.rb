module Api
  module V1
    class EmployeesController < ApplicationController
      before_action :set_employee, only: %i[show update destroy]

      def index
        result = EmployeesQuery.new(list_params).call

        render json: {
          data: result.records.map { |employee| EmployeeSerializer.call(employee) },
          meta: {
            page: result.page,
            per_page: result.per_page,
            total: result.total,
            total_pages: result.total_pages
          }
        }
      end

      def show
        render json: { data: EmployeeSerializer.call(@employee) }
      end

      def create
        employee = Employee.new(employee_params)

        if employee.save
          render json: { data: EmployeeSerializer.call(employee) }, status: :created
        else
          render_errors(employee)
        end
      end

      def update
        if @employee.update(employee_params)
          render json: { data: EmployeeSerializer.call(@employee) }
        else
          render_errors(@employee)
        end
      end

      def destroy
        @employee.destroy!
        head :no_content
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      end

      def list_params
        params.permit(:page, :per_page, :q, :country, :department, :job_title, :sort, :direction)
      end

      def employee_params
        params.require(:employee)
              .permit(:full_name, :email, :job_title, :department, :country, :salary, :hired_on)
      end

      def render_errors(employee)
        render json: { errors: employee.errors.to_hash }, status: :unprocessable_content
      end
    end
  end
end
