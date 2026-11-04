export type Employee = {
  id: number;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  hired_on: string;
  created_at: string;
  updated_at: string;
};

export type EmployeeInput = Pick<
  Employee,
  'full_name' | 'email' | 'job_title' | 'department' | 'country' | 'hired_on'
> & { salary: number | '' };

export type PageMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type SortDirection = 'asc' | 'desc';
export type SortColumn = 'full_name' | 'salary' | 'hired_on' | 'country' | 'job_title' | 'department';

export type EmployeeListParams = {
  page: number;
  per_page: number;
  q?: string;
  country?: string;
  department?: string;
  job_title?: string;
  sort: SortColumn;
  direction: SortDirection;
};

export type EmployeeList = { data: Employee[]; meta: PageMeta };

export type Meta = {
  countries: { name: string; currency: string }[];
  departments: string[];
  job_titles: string[];
};

export type SalaryStats = {
  headcount: number;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
};

export type CountryStats = SalaryStats & {
  country: string;
  currency: string;
  median_salary: number;
};

export type GroupStats = SalaryStats & { name: string };

export type Overview = {
  total_headcount: number;
  country_count: number;
  countries: CountryStats[];
};

export type CountryBreakdown = CountryStats & {
  by_job_title: GroupStats[];
  by_department: GroupStats[];
};

export type FieldErrors = Partial<Record<keyof EmployeeInput | 'base', string[]>>;
