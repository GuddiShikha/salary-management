import type { CountryBreakdown, Employee, Meta, Overview } from '../api/types';

export const meta: Meta = {
  countries: [
    { name: 'India', currency: 'INR' },
    { name: 'United States', currency: 'USD' },
  ],
  departments: ['Engineering', 'Sales'],
  job_titles: ['Account Executive', 'Software Engineer'],
};

export const employee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 1,
  full_name: 'Asha Rao',
  email: 'asha@acme.example',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country: 'India',
  currency: 'INR',
  salary: 1_800_000,
  hired_on: '2021-04-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const overview: Overview = {
  total_headcount: 3,
  country_count: 2,
  countries: [
    { country: 'India', currency: 'INR', headcount: 2, min_salary: 1_000_000, max_salary: 2_000_000, avg_salary: 1_500_000, median_salary: 1_500_000 },
    { country: 'United States', currency: 'USD', headcount: 1, min_salary: 90_000, max_salary: 90_000, avg_salary: 90_000, median_salary: 90_000 },
  ],
};

export const indiaBreakdown: CountryBreakdown = {
  ...overview.countries[0]!,
  by_job_title: [
    { name: 'Software Engineer', headcount: 2, min_salary: 1_000_000, max_salary: 2_000_000, avg_salary: 1_500_000 },
  ],
  by_department: [
    { name: 'Engineering', headcount: 2, min_salary: 1_000_000, max_salary: 2_000_000, avg_salary: 1_500_000 },
  ],
};
