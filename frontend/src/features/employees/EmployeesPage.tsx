import {
  Alert,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import type { Employee, EmployeeListParams, SortColumn } from '../../api/types';
import { formatNumber } from '../../lib/format';
import { useDeleteEmployee, useEmployees, useMeta } from '../queries';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeTable } from './EmployeeTable';

const PER_PAGE = 25;

type Filters = { country: string | null; department: string | null; job_title: string | null };
const NO_FILTERS: Filters = { country: null, department: null, job_title: null };

export const EmployeesPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Pick<EmployeeListParams, 'sort' | 'direction'>>({
    sort: 'full_name',
    direction: 'asc',
  });
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  const params: EmployeeListParams = {
    page,
    per_page: PER_PAGE,
    q: debouncedSearch.trim() || undefined,
    country: filters.country ?? undefined,
    department: filters.department ?? undefined,
    job_title: filters.job_title ?? undefined,
    ...sort,
  };

  const employees = useEmployees(params);
  const meta = useMeta();
  const remove = useDeleteEmployee();

  const updateFilter = (key: keyof Filters) => (value: string | null) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const handleSort = (column: SortColumn) => {
    setSort((current) => ({
      sort: column,
      direction: current.sort === column && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const openForm = (employee: Employee | null) => {
    setEditing(employee);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      notifications.show({ color: 'green', message: `${deleting.full_name} deleted` });
    } catch (error) {
      notifications.show({ color: 'red', message: (error as Error).message });
    } finally {
      setDeleting(null);
    }
  };

  const hasFilters = Boolean(search) || Object.values(filters).some(Boolean);
  const pageMeta = employees.data?.meta;
  const firstRow = pageMeta && pageMeta.total > 0 ? (pageMeta.page - 1) * pageMeta.per_page + 1 : 0;
  const lastRow = pageMeta ? Math.min(pageMeta.page * pageMeta.per_page, pageMeta.total) : 0;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Employees</Title>
          <Text c="dimmed" size="sm">
            {pageMeta ? `${formatNumber(pageMeta.total)} employees` : 'Loading…'}
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => openForm(null)}>
          Add employee
        </Button>
      </Group>

      <Card withBorder padding="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <TextInput
            aria-label="Search employees"
            placeholder="Search name or email"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
          />
          <Select
            aria-label="Filter by country"
            placeholder="All countries"
            clearable
            searchable
            data={meta.data?.countries.map((c) => c.name) ?? []}
            value={filters.country}
            onChange={updateFilter('country')}
          />
          <Select
            aria-label="Filter by department"
            placeholder="All departments"
            clearable
            searchable
            data={meta.data?.departments ?? []}
            value={filters.department}
            onChange={updateFilter('department')}
          />
          <Select
            aria-label="Filter by job title"
            placeholder="All job titles"
            clearable
            searchable
            data={meta.data?.job_titles ?? []}
            value={filters.job_title}
            onChange={updateFilter('job_title')}
          />
        </SimpleGrid>
        {hasFilters && (
          <Group justify="flex-end" mt="xs">
            <Button
              variant="subtle"
              size="xs"
              onClick={() => {
                setSearch('');
                setFilters(NO_FILTERS);
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          </Group>
        )}
      </Card>

      <Card withBorder padding={0}>
        {employees.isError ? (
          <Alert color="red" m="md" title="Could not load employees">
            {employees.error.message}
          </Alert>
        ) : employees.isPending ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : employees.data.data.length === 0 ? (
          <Stack align="center" p="xl" gap="xs">
            <IconUsers size={32} opacity={0.5} />
            <Text c="dimmed">No employees match your filters.</Text>
          </Stack>
        ) : (
          <EmployeeTable
            employees={employees.data.data}
            sort={sort.sort}
            direction={sort.direction}
            onSort={handleSort}
            onEdit={openForm}
            onDelete={setDeleting}
          />
        )}
      </Card>

      {pageMeta && pageMeta.total > 0 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Showing {formatNumber(firstRow)}–{formatNumber(lastRow)} of {formatNumber(pageMeta.total)}
          </Text>
          <Pagination total={pageMeta.total_pages} value={page} onChange={setPage} size="sm" />
        </Group>
      )}

      <EmployeeFormModal
        opened={formOpen}
        onClose={() => setFormOpen(false)}
        employee={editing}
        meta={meta.data}
      />

      <Modal opened={deleting !== null} onClose={() => setDeleting(null)} title="Delete employee" centered>
        <Text size="sm">
          Delete <b>{deleting?.full_name}</b>? This cannot be undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button color="red" loading={remove.isPending} onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
};
