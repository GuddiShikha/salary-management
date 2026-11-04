import { request } from './client';
import type {
  CountryBreakdown,
  Employee,
  EmployeeInput,
  EmployeeList,
  EmployeeListParams,
  Meta,
  Overview,
} from './types';

export const listEmployees = (params: EmployeeListParams) =>
  request<EmployeeList>('/employees', { query: params });

export const createEmployee = (employee: EmployeeInput) =>
  request<{ data: Employee }>('/employees', { method: 'POST', body: { employee } }).then((r) => r.data);

export const updateEmployee = (id: number, employee: EmployeeInput) =>
  request<{ data: Employee }>(`/employees/${id}`, { method: 'PATCH', body: { employee } }).then(
    (r) => r.data,
  );

export const deleteEmployee = (id: number) =>
  request<void>(`/employees/${id}`, { method: 'DELETE' });

export const fetchMeta = () => request<{ data: Meta }>('/meta').then((r) => r.data);

export const fetchOverview = () =>
  request<{ data: Overview }>('/insights/overview').then((r) => r.data);

export const fetchCountryBreakdown = (country: string) =>
  request<{ data: CountryBreakdown }>('/insights/country', { query: { country } }).then(
    (r) => r.data,
  );
