module EmployeeSerializer
  module_function

  def call(employee)
    {
      id: employee.id,
      full_name: employee.full_name,
      email: employee.email,
      job_title: employee.job_title,
      department: employee.department,
      country: employee.country,
      currency: employee.currency,
      salary: employee.salary&.to_f,
      hired_on: employee.hired_on&.iso8601,
      created_at: employee.created_at&.iso8601,
      updated_at: employee.updated_at&.iso8601
    }
  end
end
