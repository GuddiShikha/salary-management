import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  fetchCountryBreakdown,
  fetchMeta,
  fetchOverview,
  listEmployees,
  updateEmployee,
} from '../api/endpoints';
import type { EmployeeInput, EmployeeListParams } from '../api/types';

export const queryKeys = {
  employees: (params?: EmployeeListParams) => ['employees', ...(params ? [params] : [])] as const,
  meta: ['meta'] as const,
  insights: ['insights'] as const,
  overview: ['insights', 'overview'] as const,
  country: (country: string) => ['insights', 'country', country] as const,
};

export const useEmployees = (params: EmployeeListParams) =>
  useQuery({
    queryKey: queryKeys.employees(params),
    queryFn: () => listEmployees(params),
    placeholderData: keepPreviousData,
  });

export const useMeta = () => useQuery({ queryKey: queryKeys.meta, queryFn: fetchMeta });

export const useOverview = () => useQuery({ queryKey: queryKeys.overview, queryFn: fetchOverview });

export const useCountryBreakdown = (country: string | null) =>
  useQuery({
    queryKey: queryKeys.country(country ?? ''),
    queryFn: () => fetchCountryBreakdown(country!),
    enabled: Boolean(country),
  });

// Any change to an employee can affect lists, dropdown options and aggregates.
const useInvalidateEmployeeData = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.employees() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.meta }),
      queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
    ]);
};

export const useSaveEmployee = () => {
  const invalidate = useInvalidateEmployeeData();
  return useMutation({
    mutationFn: ({ id, input }: { id?: number; input: EmployeeInput }) =>
      id ? updateEmployee(id, input) : createEmployee(input),
    onSuccess: invalidate,
  });
};

export const useDeleteEmployee = () => {
  const invalidate = useInvalidateEmployeeData();
  return useMutation({ mutationFn: deleteEmployee, onSuccess: invalidate });
};
